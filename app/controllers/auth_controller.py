from flask import Blueprint, request, jsonify, make_response
from services.auth_service import AuthService
import datetime
from common.utils.error_util import AuthenticationError, UserNotFoundError

auth_controller = Blueprint("auth_controller", __name__)
auth_service = AuthService()


@auth_controller.route("/auth/token", methods=["PUT"])
def get_new_token():
    try:
        refresh_token = request.cookies.get('refresh_token')
        user_data = auth_service.get_new_token(refresh_token)
        res = make_response({
            "ok": True,
            'user_id': user_data.get('user_id')
        }, 200)
        if 'access_token' in user_data and 'refresh_token' in user_data:
            res.set_cookie('access_token',
                           user_data.get('access_token'),
                           expires=datetime.datetime.utcnow() +
                           datetime.timedelta(minutes=60),
                           httponly=True)
            res.set_cookie('refresh_token',
                           user_data.get('refresh_token'),
                           expires=datetime.datetime.utcnow() +
                           datetime.timedelta(days=30))
        return res
    except AuthenticationError as e:
        response = make_response({'error': True, 'message': str(e)}, 401)
        response.set_cookie('refresh_token', '', expires=0)
        return response


@auth_controller.route("/auth/register", methods=["POST"])
def handle_user_auth():
    try:
        identifier = request.json.get('identifier')
        password = request.json.get('password')
        login_type = request.json.get('login_type')
        user_data = auth_service.handle_user_auth(login_type, password,
                                                  identifier)
        res = make_response({
            "ok": True,
            'user_id': user_data.get('user_id')
        }, 200)
        if 'access_token' in user_data and 'refresh_token' in user_data:
            res.set_cookie('access_token',
                           user_data.get('access_token'),
                           expires=datetime.datetime.utcnow() +
                           datetime.timedelta(minutes=60),
                           httponly=True)
            res.set_cookie('refresh_token',
                           user_data.get('refresh_token'),
                           expires=datetime.datetime.utcnow() +
                           datetime.timedelta(days=30))
        return res
    except AuthenticationError as e:
        return {'error': True, 'message': str(e)}, 401
    except Exception as error:
        return {'error': str(error)}, 500


@auth_controller.route("/auth/status", methods=["GET"])
def get_user_status():
    try:
        access_token = request.cookies.get('access_token')
        user_data = auth_service.get_user_status(access_token)
        return {
            'ok': True,
            'user_id': user_data.get('user_id'),
            'user_type': user_data.get('user_type'),
            'match_today': user_data.get('match_today'),
            'match_tomorrow': user_data.get('match_tomorrow')
        }, 200

    except AuthenticationError as e:
        response = make_response({'error': True, 'message': str(e)}, 401)
        return response
    except UserNotFoundError as e:
        response = make_response({'error': True, 'message': str(e)}, 404)
        return response


@auth_controller.route("/auth/logout", methods=["POST"])
def handle_user_logout():
    response = make_response(jsonify({"ok": True}), 200)
    response.set_cookie('access_token', expires=0)
    response.set_cookie('refresh_token', expires=0)
    return response
