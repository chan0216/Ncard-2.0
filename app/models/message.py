from common.configs.db_config import db
from datetime import datetime
from sqlalchemy import and_, desc, func


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    friend_id = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.Text)
    sent_time = db.Column(db.DateTime, nullable=False, default=datetime.now)

    @classmethod
    def query_last_messages(cls, friend_id_list, render_index, render_num):
        subquery = cls.query.with_entities(cls.friend_id, func.max(cls.id).label('max_id'))\
            .filter(cls.friend_id.in_(friend_id_list))\
            .group_by(cls.friend_id)\
            .subquery()

        messages = cls.query\
            .join(subquery, and_(cls.friend_id == subquery.c.friend_id, cls.id == subquery.c.max_id))\
            .with_entities(cls.friend_id, cls.message, cls.sent_time)\
            .order_by(desc(cls.sent_time),desc(cls.id)).offset(render_index).limit(render_num)\
            .all()

        return messages

    @classmethod
    def query_last_room(cls, user_id):
        try:
            message = cls.query.filter(cls.user_id == user_id).order_by(
                desc(cls.id)).first()
            return message
        except Exception as e:
            raise e

    @classmethod
    def query_room_users(cls, room_id):
        try:
            users = cls.query.with_entities(
                cls.user_id).filter(cls.friend_id == room_id).distinct().all()
            return users
        except Exception as e:
            raise e

    @classmethod
    def query_all_messages(cls, friend_id, render_index, render_num):
        try:
            messages = cls.query.with_entities(cls.user_id, cls.message, cls.sent_time).filter(cls.friend_id == friend_id)\
                            .order_by(cls.sent_time.desc())\
                            .limit(render_num)\
                            .offset(render_index)\
                            .all()
            return messages
        except Exception as e:
            raise e
