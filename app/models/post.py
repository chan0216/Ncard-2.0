from common.configs.db_config import db
from models.user import User
from models.post_board import PostBoard
from datetime import datetime
from sqlalchemy import desc, func


class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    board_id = db.Column(db.Integer)
    title = db.Column(db.String(255))
    content = db.Column(db.Text)
    time = db.Column(db.TIMESTAMP, default=datetime.now)
    first_img = db.Column(db.String(255))
    like_count = db.Column(db.Integer, default=0)
    comment_count = db.Column(db.Integer, default=0)

    @classmethod
    def query_post(cls, post_id):
        return cls.query.filter_by(id=post_id).first()

    @classmethod
    def query_hot_posts(cls, render_index, render_num, board_id=None):
        try:
            conditions = []
            if board_id:
                conditions.append(cls.board_id == board_id)
            hot_posts = cls.query.filter(*conditions).join(User, User.user_id == cls.user_id).\
            join(PostBoard, PostBoard.id == cls.board_id).\
            with_entities(cls.id, cls.user_id, cls.title, cls.content, cls.time, cls.first_img, cls.like_count, cls.comment_count,User.gender,User.school,PostBoard.name.label('board_name')).\
            order_by(desc(cls.like_count), cls.id).offset(render_index).limit(render_num).\
            all()
            return hot_posts
        except Exception as e:
            raise (e)

    @classmethod
    def query_new_posts(cls, render_index, render_num, board_id=None):
        try:
            conditions = []
            if board_id:
                conditions.append(cls.board_id == board_id)
            new_posts = cls.query.filter(*conditions).join(User, User.user_id == cls.user_id).\
            join(PostBoard, PostBoard.id == cls.board_id).\
            with_entities(cls.id, cls.user_id, cls.title, cls.content, cls.time, cls.first_img, cls.like_count, cls.comment_count,User.gender,User.school,PostBoard.name.label('board_name')).\
            order_by(desc(cls.id)).offset(render_index).limit(render_num).\
            all()
            return new_posts
        except Exception as e:
            raise (e)

    @classmethod
    def query_post_with_user(cls, id):
        try:
            post = cls.query.join(User, User.user_id == cls.user_id).\
                join(PostBoard, PostBoard.id == cls.board_id).\
                with_entities(cls.title, cls.content, func.date_format(cls.time, '%m-%d %H:%i').label('time'), cls.comment_count, cls.like_count, User.gender, User.school,PostBoard.name.label('board_name'),PostBoard.eng_name).\
                filter(cls.id == id).\
                first()
            return post
        except Exception as e:
            raise (e)
