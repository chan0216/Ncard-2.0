from common.configs.db_config import db
from sqlalchemy import and_


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(45), nullable=False)
    password = db.Column(db.String(128))
    name = db.Column(db.String(45))
    gender = db.Column(db.Enum("F", "M"))
    school = db.Column(db.String(45))
    image = db.Column(db.String(255))
    type = db.Column(db.Integer, default=1)
    interest = db.Column(db.Text)
    club = db.Column(db.Text)
    course = db.Column(db.Text)
    country = db.Column(db.Text)
    worry = db.Column(db.Text)
    exchange = db.Column(db.Text)
    trying = db.Column(db.Text)
    completed_date = db.Column(db.DateTime)

    @classmethod
    def query_user(cls, username=None, user_id=None):
        try:
            conditions = []
            if user_id is not None:
                conditions.append(cls.user_id == user_id)
            if username is not None:
                conditions.append(cls.username == username)

            user = cls.query.filter(and_(*conditions)).first()
            return user
        except Exception as e:
            raise (e)

    @classmethod
    def query_user_profile(cls, user_id=None):
        try:
            conditions = []
            if user_id is not None:
                conditions.append(cls.user_id == user_id)

            user = cls.query.with_entities(
                cls.user_id, cls.type, cls.name, cls.gender, cls.school,
                cls.image, cls.interest, cls.club, cls.course, cls.country,
                cls.worry, cls.exchange, cls.trying,
                cls.completed_date).filter(and_(*conditions)).first()
            return user
        except Exception as e:
            raise (e)

    @classmethod
    def query_chatroom_profile(cls, user_id=None):
        try:
            conditions = []
            if user_id is not None:
                conditions.append(cls.user_id == user_id)
            user = cls.query.with_entities(cls.user_id,
                                           cls.name, cls.image).filter(
                                               and_(*conditions)).first()
            return user
        except Exception as e:
            raise (e)