from flask_sqlalchemy import SQLAlchemy
from decouple import config

db = SQLAlchemy()

def init_app(app):
    db_user = config('DB_USER')
    db_password = config('DB_PASSWORD')
    db_hostname = config('DB_HOSTNAME')
    db_name = config('DB_NAME')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_user}:{db_password}@{db_hostname}/{db_name}'
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)





