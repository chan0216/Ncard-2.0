import jwt
from models.user import User
from flask_bcrypt import Bcrypt
from common.utils.error_util import AuthenticationError, UserNotFoundError
from decouple import config
from google.oauth2 import id_token
from google.auth.transport import requests
from common.utils.data_util import row_to_dict
from common.utils.db_util import add_value
from datetime import datetime, timedelta

bcrypt = Bcrypt()


class AuthService():

    def __init__(self):
        self.secret_key = config('SECRET_KEY')
        self.cliend_id = config('CLIENT_ID')

    def generate_tokens(self, user_id, username):
        access_token_exp = datetime.utcnow() + timedelta(minutes=15)
        refresh_token_exp = datetime.utcnow() + timedelta(days=7)
        access_token_payload = {
            "user_id": user_id,
            "username": username,
            "exp": access_token_exp
        }
        access_token = jwt.encode(access_token_payload,
                                  self.secret_key,
                                  algorithm='HS256')
        refresh_token_payload = {
            "user_id": user_id,
            "username": username,
            "exp": refresh_token_exp
        }
        refresh_token = jwt.encode(refresh_token_payload,
                                   self.secret_key,
                                   algorithm='HS256')
        return access_token, refresh_token

    def get_new_token(self, refresh_token):
        if refresh_token is None:
            raise AuthenticationError('遺失refresh_token,請重新登入')
        try:
            refresh_data = jwt.decode(refresh_token,
                                      self.secret_key,
                                      algorithms=["HS256"])
            user_id = refresh_data.get('user_id')
            username = refresh_data.get("username")
            user = User.query_user(user_id=user_id)
            if not user:
                raise AuthenticationError('找不到使用者，請重新登入')

            access_token, refresh_token = self.generate_tokens(
                user_id, username)
            return {
                'user_id': user_id,
                'access_token': access_token,
                'refresh_token': refresh_token
            }

        except (jwt.InvalidTokenError, jwt.ExpiredSignatureError) as e:
            raise AuthenticationError('無效或過期的refresh_token,請重新登入')

    def verify_google_token(self, google_token):
        try:
            id_info = id_token.verify_oauth2_token(google_token,
                                                   requests.Request(),
                                                   self.cliend_id)
            if id_info["iss"] not in [
                    "accounts.google.com", "https://accounts.google.com"
            ]:
                return None
            if id_info["aud"] != self.cliend_id:
                return None
            return id_info
        except Exception as e:
            raise e

    def handle_user_auth(self, login_type, password, identifier):
        if login_type == "Google":
            id_info = self.verify_google_token(identifier)
            if not id_info:
                raise AuthenticationError("驗證google token發生異常")
            username = id_info.get("sub")
            hash_password = None
        else:
            username = identifier
            hash_password = bcrypt.generate_password_hash(password)

        user = User.query_user(username=username)
        if not user:
            user = add_value(User, username=username, password=hash_password)
        user_dict = row_to_dict(user)
        user_id = user_dict.get("user_id")
        username = user_dict.get("username")

        if login_type != "Google" and not bcrypt.check_password_hash(
                user_dict.get("password"), password):
            raise AuthenticationError("密碼驗證錯誤")
        access_token, refresh_token = self.generate_tokens(user_id, username)
        return {
            'user_id': user_id,
            'access_token': access_token,
            'refresh_token': refresh_token
        }

    def get_user_status(self, access_token):
        try:
            user_data = jwt.decode(access_token,
                                   config('SECRET_KEY'),
                                   algorithms=["HS256"])
            user = User.query_user(user_id=user_data.get('user_id'))
            match_today = False
            match_tomorrow = False
            now = datetime.now()
            start_of_today = datetime(now.year, now.month, now.day)
            end_of_match_period_today = start_of_today + timedelta(hours=23)

            if user.completed_date:
                if start_of_today - timedelta(
                        hours=1
                ) <= user.completed_date < end_of_match_period_today:
                    match_today = True
                elif end_of_match_period_today <= user.completed_date < start_of_today + timedelta(
                        days=1):
                    match_tomorrow = True

            if user:
                return {
                    'user_id': user.user_id,
                    'user_type': user.type,
                    'match_today': match_today,
                    'match_tomorrow': match_tomorrow
                }
            else:
                raise UserNotFoundError('找不到使用者，請重新登入')

        except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
            raise AuthenticationError('無效或過期的access_token，請重新登入')