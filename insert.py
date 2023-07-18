import pymysql
from decouple import config
from flask_bcrypt import Bcrypt

db = pymysql.connect(host=config('DB_HOSTNAME'),
                     user=config('DB_USER'),
                     password=config('DB_PASSWORD'),
                     db=config('DB_NAME'))
bcrypt = Bcrypt()


def generate_user():
    user_list = []
    for i in range(101, 201):  # 從3到100
        image_index = (i % 10) + 10 if (i % 10) != 0 else 20  # 循環生成10-20的索引
        url = f"https://d3cg2vur0g3vo5.cloudfront.net/image{image_index}.jpeg"
        password = f'test{i}'
        hash_password = bcrypt.generate_password_hash(password)
        user_list.append((f'test{i}@test.com', hash_password, f'測試帳號{i}', 'M',
                          '國立高雄科技大學', url, 3, '看劇、打遊戲', '台灣', '想要出國走走'))
    return user_list


def insert_test_user(user_list):
    try:
        cursor = db.cursor()
        sql = "INSERT INTO users (username,password,name,gender,school,image,type,interest,country,trying) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.executemany(sql, user_list)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(e)
        return False
    finally:
        cursor.close()


def process():
    user_list = generate_user()
    print(user_list)
    result = insert_test_user(user_list)
    print(result)


def update_user_password():
    try:
        cursor = db.cursor()
        passwords = [(bcrypt.generate_password_hash(f'test{i}000chan'), i + 2)
                     for i in range(3, 203)]
        print(passwords)
        update_query = "UPDATE users SET password = %s WHERE user_id = %s"
        cursor.executemany(update_query, passwords)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        print(e)
        return False
    finally:
        cursor.close()


update_user_password()