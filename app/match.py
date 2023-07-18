import pymysql
import random
from datetime import date, timedelta, datetime, time
from decouple import config

db = pymysql.connect(host=config('DB_HOSTNAME'),
                     user=config('DB_USER'),
                     password=config('DB_PASSWORD'),
                     db=config('DB_NAME'))

today = date.today()
tomorrow = today + timedelta(days=1)
# 設定填寫配對資料的截止時間為今天的晚上11點
query_time = datetime.combine(today, time(hour=23))


def query_today_match_user():
    print(query_time)
    match_dict = {}
    query_sql = """
    SELECT user_id FROM users where type = %s and completed_date < %s
    """
    try:
        cursor = db.cursor()
        cursor.execute(query_sql, (3, query_time))
        users = cursor.fetchall()
        for user in users:
            matched_user_list = query_past_match(user)
            match_dict.update({user[0]: matched_user_list})
    finally:
        cursor.close()
    return match_dict


def query_past_match(user):
    try:
        cursor = db.cursor()
        query_sql = """
        SELECT match_user_id FROM daily_match where user_id = %s and match_date < %s
        """
        cursor.execute(query_sql, (user, today))
        matched_users = cursor.fetchall()
        matched_user_list = [user[0] for user in matched_users]
    finally:
        cursor.close()
    return matched_user_list


def make_pairs(match_dict):
    remaining_users = list(match_dict.keys())
    #若配對人數是奇數，移除第一位測試帳號
    if (len(remaining_users) % 2) != 0:
        del remaining_users[0]

    def backtrack(pairs, remaining_users):
        if not remaining_users:
            return pairs

        user = remaining_users[0]
        available_users = list(
            set(remaining_users) - set(match_dict[user]) - {user})

        if not available_users:
            return None

        random.shuffle(available_users)
        for partner in available_users:
            new_pairs = pairs + [[user, partner]]
            new_remaining_users = [
                u for u in remaining_users if u not in [user, partner]
            ]

            result = backtrack(new_pairs, new_remaining_users)
            if result is not None:
                return result

        return None

    pairs = backtrack([], remaining_users)
    return pairs


def match_process():
    pairs_list = []
    match_dict = query_today_match_user()
    pairs = make_pairs(match_dict)
    if pairs:
        #若有配對結果的話存入資料庫
        for pair in pairs:
            user1, user2 = pair
            pairs_list.append((user1, user2, tomorrow))
            pairs_list.append((user2, user1, tomorrow))
        insert_pairs(pairs_list)
    else:
        #都配對過的情況
        clean_match()
        match_process()


def clean_match():
    try:
        cursor = db.cursor()
        sql = "TRUNCATE TABLE daily_match"
        cursor.execute(sql)
        db.commit()
    except:
        db.rollback()
    finally:
        cursor.close()


def insert_pairs(pairs_list):
    try:
        cursor = db.cursor()
        sql = "INSERT INTO daily_match (user_id, match_user_id, match_date) VALUES (%s, %s, %s)"
        cursor.executemany(sql, pairs_list)
        db.commit()
        return True
    except:
        cursor.rollback()
        return False
    finally:
        cursor.close()


match_process()