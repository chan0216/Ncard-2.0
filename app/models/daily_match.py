from common.configs.db_config import db
from datetime import date


class DailyMatch(db.Model):
    __tablename__ = 'daily_match'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    match_user_id = db.Column(db.Integer, nullable=False)
    match_date = db.Column(db.Date, nullable=False, default=date.today())

    @classmethod
    def query_user_match(cls, user_id):
        conditions = []
        conditions.append(cls.match_date == date.today())
        conditions.append(cls.user_id == user_id)
        match = cls.query.filter(*conditions).first()
        return match