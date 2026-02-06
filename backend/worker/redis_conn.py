import os
import redis
from rq import Worker, Queue
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

def get_redis_connection():
    """Get Redis connection"""
    # RQ stores binary payloads; disable response decoding to avoid UnicodeDecodeError.
    return redis.from_url(REDIS_URL, decode_responses=False)

def get_queue():
    """Get RQ Queue"""
    redis_conn = get_redis_connection()
    return Queue("bulk", connection=redis_conn)

def get_worker():
    """Get RQ Worker"""
    redis_conn = get_redis_connection()
    return Worker([Queue("bulk", connection=redis_conn)], connection=redis_conn)
