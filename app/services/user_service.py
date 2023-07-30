import base64
import json
from flask_bcrypt import Bcrypt
from models.user import User
from models.friend import Friend
from models.message import Message
from models.daily_match import DailyMatch
from models.friend_request import FriendRequest
from models.user_post_like import UserPostLike
from common.utils.error_util import UserNotFoundError, NoFriendsFoundError, UserTypeError
from common.utils.data_util import selected_columns_to_dict, get_paginated_data
from common.utils.db_util import add_value, update_value
from services.auth_service import AuthService
from datetime import datetime
from common.configs.s3_config import s3
from common.configs.redis_config import redis

bcrypt = Bcrypt()
auth_service = AuthService()

UPDATE_TYPE_MAP = {1: 'basic_info', 2: 'match_info', 3: 'match_info'}


class UserService:

    def update_user_profile(self, user_id, data):
        user = User.query_user(user_id=user_id)
        if not user:
            raise UserNotFoundError('找不到使用者')
        user_type = user.type
        expected_update_type = UPDATE_TYPE_MAP.get(user_type)
        if data['update_type'] != expected_update_type:
            raise UserTypeError('更新的項目與等級不符')
        if user_type == 1 and data['update_type'] == 'basic_info':
            data['type'] = 2
        if user_type == 2 and data['update_type'] == 'match_info':
            data['type'] = 3
            data['completed_date'] = datetime.now()
        try:
            if 'image' in data:
                if data['image'].startswith('data:image'):
                    image_data = data.get('image').split('base64,')[-1]
                    image_bytes = base64.b64decode(image_data)
                    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                    image_name = f"user{user_id}_{timestamp}.jpg"
                    s3.put_object(Bucket='ncard-bucket',
                                  Key=image_name,
                                  Body=image_bytes)

                    url = f"https://d3cg2vur0g3vo5.cloudfront.net/{image_name}"
                    data['image'] = url
            update_value(user, **data)
            return True
        except Exception as e:
            return False

    def get_current_user_profile(self, user_id):
        user = User.query_user_profile(user_id=user_id)
        user_dict = selected_columns_to_dict(user)
        return user_dict

    def get_user_friends(self, page, user_id):
        try:
            page = int(page)
        except:
            return None, None

        render_num = 9
        render_index = page * render_num
        redis_key = f'user:{user_id}:friends:{page}'
        friends_list = None
        try:
            friends_list = redis.get(redis_key)
            if friends_list:
                friends_list = json.loads(friends_list)
            else:
                friends_list = self.get_user_friends_by_db(
                    user_id, render_index, render_num)
        except Exception as e:
            print(e)
            friends_list = self.get_user_friends_by_db(user_id, render_index,
                                                       render_num)
        try:
            redis.set(redis_key, json.dumps(friends_list))
        except:
            pass
        if len(friends_list) > render_num:
            next_page = page + 1
            friends_list = friends_list[:render_num]
        else:
            next_page = None

        return friends_list, next_page

    def get_user_friends_by_db(self, user_id, render_index, render_num):
        friends = Friend.query_friends(user_id, render_index, render_num + 1)
        if not friends:
            raise NoFriendsFoundError('找不到好友')
        friends_list = []
        for friend in friends:
            if friend.user1_id == int(user_id):
                friend_id = friend.user2_id
            if friend.user2_id == int(user_id):
                friend_id = friend.user1_id
            friend_info = User.query_user_profile(user_id=friend_id)
            friends_list.append({
                'user_id': friend_info.user_id,
                'name': friend_info.name,
                'school': friend_info.school,
                'image': friend_info.image,
            })
        return friends_list

    def get_user_match(self, user_id):
        match = DailyMatch.query_user_match(user_id)
        if not match:
            raise Exception("今日沒有配對")
        if match is not None:
            matched_user = match.match_user_id
        user = User.query_user_profile(user_id=matched_user)
        match_user = selected_columns_to_dict(user)
        # 檢查單方的邀請
        invitation = FriendRequest.query_invitation_from_current_user(
            user_id, match_user['user_id'])
        if invitation is not None:
            match_user['invited'] = True
        else:
            match_user['invited'] = False

        # 檢查是否已成為好友
        friendship = Friend.query_friend(user_id, match_user['user_id'])
        if friendship is not None:
            match_user['is_friend'] = True
        else:
            match_user['is_friend'] = False

        return match_user

    def add_user_invitations(self, user_id, data):
        add_value(FriendRequest,
                  sender_id=user_id,
                  receiver_id=data['match_id'],
                  message=data['message'])
        invitation_from_current_user = FriendRequest.query_invitation_from_current_user(
            user_id, data['match_id'])
        invitation_from_match_user = FriendRequest.query_invitation_from_match_user(
            user_id, data['match_id'])
        if invitation_from_current_user and invitation_from_current_user.message and invitation_from_match_user and invitation_from_match_user.message:
            is_friend = True
        else:
            is_friend = False
        if is_friend:
            new_friend = add_value(Friend,
                                   user1_id=user_id,
                                   user2_id=data['match_id'])
            friend_id = new_friend.id
            add_value(Message,
                      friend_id=friend_id,
                      user_id=user_id,
                      message=data['message'])
            add_value(Message,
                      friend_id=friend_id,
                      user_id=data['match_id'],
                      message=invitation_from_match_user.message)
            # 刪除所有跟使用者有關的好友列表的 Redis 鍵
            try:
                for key in redis.scan_iter(f"user:{user_id}:friends:*"):
                    redis.delete(key)
                for key in redis.scan_iter(
                        f"user:{data['match_id']}:friends:*"):
                    redis.delete(key)
            except:
                pass
        return is_friend

    def get_user_info(self, current_user, query_user):
        friend = Friend.query_friend(current_user, query_user)
        if not friend:
            pass
        room_id = friend.id
        user = User.query_user_profile(user_id=query_user)
        user_dict = selected_columns_to_dict(user)
        user_dict['roomId'] = room_id
        return user_dict

    def get_user_chatrooms(self, user_id, page):
        try:
            page = int(page)
        except:
            return None

        render_num = 8
        render_index = page * render_num

        messages_list = []
        friends = Friend.get_friends(user_id)
        friends_id_list = [friend.id for friend in friends]
        messages = Message.query_last_messages(friends_id_list, render_index,
                                               render_num + 1)
        if messages:
            if len(messages) > render_num:
                next_page = page + 1
                messages = messages[:render_num]
            else:
                next_page = None
            for message in messages:
                friend_record = Friend.query_friend_by_id(message.friend_id)
                if friend_record.user1_id == int(user_id):
                    friend_user_id = friend_record.user2_id
                else:
                    friend_user_id = friend_record.user1_id
                message_dict = selected_columns_to_dict(message)
                friend_data = User.query_chatroom_profile(friend_user_id)
                friend_dict = selected_columns_to_dict(friend_data)
                message_dict.update(friend_dict)
                messages_list.append(message_dict)
            return {
                'friends_id_list': friends_id_list,
                'messages_list': messages_list,
                'next_page': next_page
            }

    def get_user_messages(self, room_id, user_id, page):
        try:
            page = int(page)
        except:
            return None

        render_num = 10
        render_index = page * render_num

        room_users = Message.query_room_users(room_id)
        room_users_list = [user.user_id for user in room_users]
        user_id = int(user_id)
        if user_id not in room_users_list:
            return None
        room_users_list.remove(user_id)
        friend_id = room_users_list[0]
        friend_data = User.query_chatroom_profile(user_id=friend_id)
        friend_dict = selected_columns_to_dict(friend_data)
        user_data = User.query_chatroom_profile(user_id=user_id)
        user_dict = selected_columns_to_dict(user_data)
        messages = Message.query_all_messages(room_id, render_index,
                                              render_num + 1)

        if len(messages) > render_num:
            next_page = page + 1
            messages = messages[:render_num]
        else:
            next_page = None
        messages_list = [selected_columns_to_dict(obj) for obj in messages]
        for obj in messages_list:
            obj['sent_time'] = obj['sent_time'].strftime("%m-%d %H:%M")
        data = {
            "user": user_dict,
            "friend": friend_dict,
            "messages": messages_list,
            "nextPage": next_page
        }
        return data

    def get_liked_posts(self, user_id, page):
        return get_paginated_data(
            page,
            UserPostLike.query_like_posts,
            user_id,
        )

    def get_last_chatroom(self, user_id):
        resp = Message.query_last_room(user_id)
        if resp:
            friend_id = resp.friend_id
            return friend_id
        else:
            return None