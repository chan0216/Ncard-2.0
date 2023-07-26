from common.configs.db_config import db
from models.user import User
from models.post import Post
from models.post_board import PostBoard
from sqlalchemy import desc


class UserPostLike(db.Model):
    __tablename__ = 'user_post_like'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    post_id = db.Column(db.Integer, nullable=False)

    @classmethod
    def query_like_status(cls, user_id, post_id):
        return cls.query.filter_by(user_id=user_id, post_id=post_id).first()

    @classmethod
    def query_like_posts(cls, user_id, render_index, render_num, board_id):
        try:
            like_posts = cls.query.join(Post, Post.id == cls.post_id).\
                join(PostBoard, PostBoard.id == Post.board_id).\
                join(User,User.user_id == Post.user_id).\
                with_entities(Post.id, Post.user_id,Post.title, Post.content, Post.time, Post.first_img, Post.like_count, Post.comment_count, User.gender, User.school,PostBoard.name.label('board_name')).\
                order_by(desc(cls.id)).filter(cls.user_id == user_id).offset(render_index).limit(render_num).\
                all()
            return like_posts

        except Exception as e:
            raise (e)
