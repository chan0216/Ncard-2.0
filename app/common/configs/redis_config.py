import redis
from decouple import config

redis = redis.Redis(host=config('REDIS_HOSTNAME'), port=6379)