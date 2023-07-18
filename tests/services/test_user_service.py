import pytest
import jwt
from app.services.user_service import UserService
from datetime import datetime, timedelta

secret_key = '123'
@pytest.fixture
def class_instance():
    return UserService(secret_key) 

def test_get_user(class_instance):
    # 正確的 access_token 和 refresh_token
    user_id = 1
    exp = datetime.utcnow() + timedelta(minutes=30)
    access_token = jwt.encode({"user_id": user_id, "exp": exp}, secret_key, algorithm="HS256")
    result = class_instance.get_user(access_token, None)
    assert result.status_code == True

    #沒有refresh token以及access token
    result = class_instance.get_user(None, None)
    assert result["error"] == True