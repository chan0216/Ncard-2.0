from flask import Blueprint, request, jsonify, make_response
from services.user_service import UserService
from common.utils.request_util import check_token
from common.utils.error_util import UserTypeError, UserNotFoundError, NoFriendsFoundError

user_controller = Blueprint("user_controller", __name__)
user_service = UserService()


@user_controller.route("/users/me", methods=["GET"])
@check_token
def get_current_user_profile(user_id):
    try:
        user_data = user_service.get_current_user_profile(user_id)
        return {'data': user_data}
    except Exception as e:
        response = make_response({'error': True, 'message': str(e)}, 500)
        return response


@user_controller.route("/users/me", methods=["PATCH"])
@check_token
def update_current_user_profile(user_id):
    try:
        data = request.json
        add_status = user_service.update_user_profile(user_id, data)
        if add_status:
            return {'ok': True}
        else:
            return {'error': True}
    except UserNotFoundError as e:
        response = make_response({'error': True, 'message': str(e)}, 401)
        return response
    except UserTypeError as e:
        response = make_response({'error': True, 'message': str(e)}, 400)
        return response


@user_controller.route("/users/me/friends", methods=["GET"])
@check_token
def get_user_friends(user_id):
    try:
        page = request.args.get('page')
        friends_list, next_page = user_service.get_user_friends(page, user_id)
        return {'data': friends_list, 'next_page': next_page}
    except NoFriendsFoundError as e:
        return {'error': True, 'message': str(e)}, 404
    except Exception as e:
        return {'error': True, 'message': str(e)}, 500


@user_controller.route("/users/me/match", methods=["GET"])
@check_token
def get_user_match(user_id):
    try:
        match_user = user_service.get_user_match(user_id)
        return {'data': match_user}
    except Exception as e:
        return {'error': True, 'message': str(e)}, 500


@user_controller.route("/users/me/invitation", methods=["POST"])
@check_token
def add_user_invitations(user_id):
    data = request.json
    is_friend = user_service.add_user_invitations(user_id, data)
    return {'IsFriend': is_friend}


@user_controller.route("/users/<int:path_user_id>", methods=["GET"])
@check_token
def get_user_info(user_id, path_user_id):
    try:
        user_data = user_service.get_user_info(user_id, path_user_id)
        return {'data': user_data}
    except Exception as e:
        return {'error': True, 'message': str(e)}, 500


@user_controller.route("/users/me/chatrooms", methods=["GET"])
@check_token
def get_user_chatrooms(user_id):
    try:
        page = request.args.get('page')
        chatrooms_list = user_service.get_user_chatrooms(user_id, page)
        return {'data': chatrooms_list}
    except Exception as e:
        return {'error': True, 'message': str(e)}, 500


@user_controller.route('/users/me/chatrooms/<int:id>', methods=['GET'])
@check_token
def get_chats(user_id, id):
    try:
        page = request.args.get('page')
        messages = user_service.get_user_messages(id, user_id, page)
        return {'data': messages}
    except Exception as error:
        return {'error': str(error)}, 500


@user_controller.route('/users/me/liked_posts', methods=['GET'])
@check_token
def get_liked_posts(user_id):
    try:
        page = request.args.get('page')
        posts_list, next_page = user_service.get_liked_posts(user_id, page)
        return {"data": posts_list, "next_page": next_page}
    except Exception as error:
        return {'error': str(error)}, 500