from functools import wraps
from flask import make_response, jsonify, request
from decouple import config
import jwt


def check_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        access_token = request.cookies.get('access_token')
        if not access_token:
            res = make_response(
                jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 401)
            return res

        try:
            jwt_data = jwt.decode(access_token, config('SECRET_KEY'), algorithms=["HS256"])
            user_id = jwt_data.get("user_id")
        except jwt.InvalidTokenError as e:
            res = make_response(
                jsonify({"error": True, "message": "無效的access token"}), 401)
            return res
        except Exception as e:
            res = make_response(
                jsonify({"error": True, "message": "伺服器錯誤"}), 500)
            return res

        return func(user_id, *args, **kwargs)

    return wrapper