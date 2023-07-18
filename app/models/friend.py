from common.configs.db_config import db
from sqlalchemy import or_
from datetime import datetime


class Friend(db.Model):
    __tablename__ = 'friends'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user1_id = db.Column(db.Integer, nullable=False)
    user2_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, default=datetime.today())

    @classmethod
    def get_friends(cls, user_id):
        conditions = []
        conditions.append(or_(cls.user1_id == user_id,
                              cls.user2_id == user_id))
        friends = cls.query.filter(*conditions).all()
        return friends

    @classmethod
    def query_friend(cls, user_id, match_id):
        conditions = []
        conditions.append(
            or_(cls.user1_id == user_id, cls.user2_id == match_id))
        conditions.append(
            or_(cls.user1_id == match_id, cls.user2_id == user_id))
        friend = cls.query.filter(or_(*conditions)).first()
        return friend

    @classmethod
    def query_friend_by_id(cls, id):
        conditions = []
        conditions.append(cls.id == id)
        friend_record = cls.query.filter(*conditions).first()
        return friend_record
