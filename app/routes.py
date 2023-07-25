from flask import render_template, redirect, url_for
from common.utils.request_util import check_token
from models.message import Message


def init_routes(app):

    @app.route('/')
    def index():
        return render_template('home.html')

    @app.route('/b/<board>')
    def board_post(board):
        return render_template('board-post.html')

    @app.route("/login")
    def login():
        return render_template("login.html")

    @app.route("/new-post")
    def newpost():
        return render_template("newpost.html")

    @app.route("/posts/<id>")
    def attraction(id):
        return render_template("post.html")

    @app.route("/my/like")
    def profile():
        return render_template("like-posts.html")

    @app.route("/verify")
    def verify():
        return render_template("verify.html")

    @app.route("/my/profile")
    def myprofile():
        return render_template("card-profile.html")

    @app.route('/my/friends')
    def friends():
        return render_template("friend.html")

    @app.route('/ncard')
    def ncard():
        return render_template("card-match.html")

    @app.route("/friend/<id>")
    def friend(id):
        return render_template("mate.html")

    @app.route('/chats', methods=['GET'])
    @check_token
    def redirect_to_last_chat_room(user_id):
        resp = Message.query_last_room(user_id)
        if resp:
            friend_id = resp.friend_id
            return redirect(url_for('chats', id=friend_id))
        return redirect(url_for('chats'))

    @app.route("/chats/<id>")
    @app.route("/chats/", defaults={'id': None})
    def chats(id):
        if id:
            return render_template("chat-room.html")
        else:
            return render_template("no-chat.html")