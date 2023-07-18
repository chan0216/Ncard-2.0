from common.configs.db_config import db
from datetime import datetime


class FriendRequest(db.Model):
    __tablename__ = 'friend_requests'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer)
    receiver_id = db.Column(db.Integer)
    message = db.Column(db.Text)
    sent_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    @classmethod
    def query_invitation_from_current_user(cls, current_user, match_user):
        return cls.query.filter_by(sender_id=current_user,
                                   receiver_id=match_user).first()

    @classmethod
    def query_invitation_from_match_user(cls, current_user, match_user):
        return cls.query.filter_by(sender_id=match_user,
                                   receiver_id=current_user).first()
