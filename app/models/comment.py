from common.configs.db_config import db
from models.user import User
from sqlalchemy import func
from datetime import datetime


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    post_id = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    floor = db.Column(db.Integer, nullable=False)
    create_time = db.Column(db.TIMESTAMP, default=datetime.now)

    @classmethod
    def query_comments(cls, post_id, render_index, render_num):
        try:
            comments = cls.query.join(User, User.user_id == cls.user_id).\
            with_entities(cls.id ,cls.comment, cls.floor, func.date_format(cls.create_time, '%m-%d').label('create_time'), User.gender, User.school).\
            filter(cls.post_id == post_id).\
            order_by(cls.id).offset(render_index).limit(render_num).\
            all()
            return comments
        except Exception as e:
            raise (e)

    @classmethod
    def query_comment(cls, id):
        try:
            comment = cls.query.join(User, User.user_id == cls.user_id).\
                with_entities(cls.id ,cls.comment, cls.floor, func.date_format(cls.create_time, '%m-%d').label('create_time'), User.gender, User.school).\
                filter(cls.id == id).\
                first()
            return comment
        except Exception as e:
            raise (e)