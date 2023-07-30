from models.post import Post
from models.comment import Comment
from models.post_board import PostBoard
from common.utils.error_util import NoPostFoundError, AddPostError
from models.user_post_like import UserPostLike
from common.utils.data_util import selected_columns_to_dict, get_paginated_data
from common.utils.db_util import add_value, delete_value, update_value
from datetime import datetime
from common.configs.s3_config import s3
import base64


class PostService:

    def get_hot_posts(self, page, board_id=None):
        return get_paginated_data(page,
                                  Post.query_hot_posts,
                                  board_id=board_id)

    def get_new_posts(self, page, board_id=None):
        return get_paginated_data(page,
                                  Post.query_new_posts,
                                  board_id=board_id)

    def get_post(self, post_id, user_id):
        post_like = None
        post = Post.query_post_with_user(post_id)
        if not post:
            raise NoPostFoundError('此文章不存在')
        post_dict = selected_columns_to_dict(post)
        if user_id:
            post_like = UserPostLike.query_like_status(user_id, post_id)
            is_liked = bool(post_like)
        else:
            is_liked = False
        post_dict['is_liked'] = is_liked
        return post_dict

    def get_board_id(self, board_name):
        board = PostBoard.query_board_data(board_name)
        if board:
            return board.id
        else:
            return None

    def patch_post_like(self, user_id, post_id):
        post_like = UserPostLike.query_like_status(user_id, post_id)
        post = Post.query_post(post_id)
        if post_like:
            post.like_count = post.like_count - 1
            delete_value(post_like)
        else:
            post.like_count = post.like_count + 1
            add_value(UserPostLike, user_id=user_id, post_id=post_id)

        return post.like_count

    def add_post(self, user_id, data):
        try:
            content = data['content']
            images = data['images']
            title = data['title']
            board_name = data['board']
            s3_urls = []

            for i, image_data in enumerate(images):
                image_data = image_data.split('base64,')[-1]
                image_bytes = base64.b64decode(image_data)
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                image_name = f"post_{user_id}_{timestamp}_{i}.jpg"
                s3.put_object(Bucket='ncard-bucket',
                              Key=image_name,
                              Body=image_bytes)

                url = f"https://d3cg2vur0g3vo5.cloudfront.net/{image_name}"
                s3_urls.append(url)

            # 在文章中替换占位符
            replace_content = content
            for i, url in enumerate(s3_urls):
                replace_content = replace_content.replace(
                    f'{{imgSrc{i}}}', url)
            #判斷是否有第一張照片
            first_img = s3_urls[0] if s3_urls else None
            board = PostBoard.query_board_data(board_name)
            post = add_value(Post,
                             user_id=user_id,
                             board_id=board.id,
                             content=replace_content,
                             title=title,
                             first_img=first_img)
            return post
        except Exception as e:
            raise e

    def get_comments(self, post_id, page):
        page = int(page)
        render_num = 10
        render_index = page * render_num
        comments = Comment.query_comments(post_id, render_index,
                                          render_num + 1)

        if len(comments) > render_num:
            next_page = page + 1
            comments = comments[:render_num]
        else:
            next_page = None

        return [selected_columns_to_dict(comment)
                for comment in comments], next_page

    def add_comments(self, user_id, post_id, data):
        content = data['content']
        images = data['images']
        if images:
            s3_urls = self.upload_images_to_s3(images, user_id)
            content = self.replace_image(content, s3_urls)

        post = Post.query_post(post_id)
        floor = post.comment_count + 1
        comment = add_value(Comment,
                            post_id=post_id,
                            user_id=user_id,
                            comment=content,
                            floor=floor)
        update_value(post, comment_count=post.comment_count + 1)
        comment_data = Comment.query_comment(comment.id)
        comment_dict = selected_columns_to_dict(comment_data)
        return comment_dict

    def upload_images_to_s3(self, images, user_id):
        s3_urls = []
        for i, image_data in enumerate(images):
            image_data = image_data.split('base64,')[-1]
            image_bytes = base64.b64decode(image_data)
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            image_name = f"post_{user_id}_{timestamp}_{i}.jpg"
            s3.put_object(Bucket='ncard-bucket',
                          Key=image_name,
                          Body=image_bytes)

            url = f"https://d3cg2vur0g3vo5.cloudfront.net/{image_name}"
            s3_urls.append(url)

        return s3_urls

    def replace_image(self, content, s3_urls):
        for i, url in enumerate(s3_urls):
            content = content.replace(f'{{imgSrc{i}}}', url)

        return content
