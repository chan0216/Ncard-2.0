from flask import Blueprint, request
from services.post_service import PostService
from common.utils.request_util import check_token
from decouple import config
from common.utils.error_util import NoPostFoundError, AddPostError
import jwt

post_controller = Blueprint("post_controller", __name__)
post_service = PostService()


@post_controller.route("/posts", methods=["GET"])
def get_posts():
    try:
        page = request.args.get('page')
        type = request.args.get('type')
        board_name = request.args.get('board')
        board_id = post_service.get_board_id(board_name)

        if type == 'new':
            posts_list, next_page = post_service.get_new_posts(page, board_id)
        if type == 'hot':
            posts_list, next_page = post_service.get_hot_posts(page, board_id)
        return {"data": posts_list, "nextPage": next_page}
    except Exception as error:
        return {'error': str(error)}, 500


@post_controller.route("/posts", methods=["POST"])
@check_token
def add_post(user_id):
    try:
        data = request.json
        post = post_service.add_post(user_id, data)
        return {'data': post.id}
    except Exception as error:
        return {'error': str(error)}, 500


@post_controller.route("/posts/<id>", methods=["GET"])
def get_post(id):
    try:
        user_id = None
        access_token = request.cookies.get('access_token')
        if access_token:
            jwt_data = jwt.decode(access_token,
                                  config('SECRET_KEY'),
                                  algorithms=["HS256"])
            user_id = jwt_data.get("user_id")
        post = post_service.get_post(id, user_id)
        return {"data": post}
    except NoPostFoundError as e:
        return {'error': str(e)}, 404
    except Exception as e:
        return {'error': str(e)}, 500


@post_controller.route("/posts/<int:post_id>/likes", methods=["PATCH"])
@check_token
def patch_post_like(user_id, post_id):
    try:
        like_count = post_service.patch_post_like(user_id, post_id)
        return {"like_count": like_count}
    except Exception as e:
        return {"error": True, "message": str(e)}, 500


@post_controller.route("/posts/<int:post_id>/comments", methods=["GET"])
def get_comments(post_id):
    try:
        page = request.args.get('page')
        comments_list, next_page = post_service.get_comments(post_id, page)
        return {"data": comments_list, "next_page": next_page}
    except Exception as e:
        return {"error": True, "message": str(e)}, 500


@post_controller.route("/posts/<int:post_id>/comments", methods=["POST"])
@check_token
def add_comments(user_id, post_id):
    try:
        data = request.json
        comment_dict = post_service.add_comments(user_id, post_id, data)
        return {"data": comment_dict}
    except Exception as e:
        return {"error": True, "message": str(e)}, 500
