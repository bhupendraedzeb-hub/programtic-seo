import sys
from pathlib import Path

from redis import Redis
from rq import Worker, Queue

backend_path = Path(__file__).resolve().parents[1] / "backend"
if str(backend_path) not in sys.path:
    sys.path.append(str(backend_path))

from app.config import settings  # noqa: E402


def main():
    redis_conn = Redis.from_url(settings.redis_url)
    queues = [Queue("bulk", connection=redis_conn)]
    worker = Worker(queues)
    worker.work(with_scheduler=False)


if __name__ == "__main__":
    main()
