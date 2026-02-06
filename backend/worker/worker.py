import os
import sys
from dotenv import load_dotenv
from rq import Worker, SimpleWorker
from rq.timeouts import TimerDeathPenalty
from .redis_conn import get_redis_connection, get_queue
import logging

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

def run_worker():
    """Start RQ worker"""
    redis_conn = get_redis_connection()
    q = get_queue()

    if os.name == "nt":
        # Windows doesn't support SIGALRM; use TimerDeathPenalty instead.
        worker = SimpleWorker([q], connection=redis_conn)
        worker.death_penalty_class = TimerDeathPenalty
    else:
        worker = Worker([q], connection=redis_conn)
    
    logger.info("Starting RQ Worker...")
    logger.info(f"Listening to queue: {q.name}")
    
    try:
        worker.work(with_scheduler=True)
    except KeyboardInterrupt:
        logger.info("Worker interrupted, shutting down...")
    except Exception as e:
        logger.error(f"Worker error: {str(e)}")
        raise

if __name__ == "__main__":
    run_worker()
