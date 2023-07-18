from flask import Flask
from common.configs.db_config import init_app
from common.configs.socketio_config import socketio
from routes import init_routes
from controllers import user_controller, post_controller, auth_controller, data_controller
from flask_socketio import join_room, emit
from datetime import datetime
from models.message import Message
from common.utils.db_util import add_value

app = Flask(__name__)
init_app(app)
app.register_blueprint(user_controller.user_controller, url_prefix='/api')
app.register_blueprint(post_controller.post_controller, url_prefix='/api')
app.register_blueprint(auth_controller.auth_controller, url_prefix='/api')
app.register_blueprint(data_controller.data_controller, url_prefix='/api')
init_routes(app)
socketio.init_app(app)


@socketio.on('join_room')
def on_join(room_id):
    join_room(room_id)


@socketio.on('send_message')
def handle_send_message(data):
    try:
        time = datetime.now()
        now = time.strftime('%Y-%m-%d %H:%M:%S')
        add_value(Message,
                  friend_id=data['roomId'],
                  message=data['message'],
                  user_id=data['userId'],
                  sent_time=now)

        data["time"] = time.strftime("%m-%d %H:%M")
        emit("receive_message", data, room=data['roomId'])
    except Exception as e:
        return {"error": True}, 500


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=3000, debug=True)