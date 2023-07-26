from common.configs.db_config import db
from datetime import datetime
from sqlalchemy import desc, func


class PostBoard(db.Model):
    __tablename__ = 'post_boards'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(45))
    eng_name = db.Column(db.String(45))

    @classmethod
    def query_board_data(cls, board_name):
        board = cls.query.filter(cls.eng_name == board_name).first()
        return board
