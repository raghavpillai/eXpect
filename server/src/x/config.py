import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    BEARER_TOKENS = [
        os.getenv('X_BEARER_TOKEN_1'),
        os.getenv('X_BEARER_TOKEN_2'),
        os.getenv('X_BEARER_TOKEN_3'),
        os.getenv('X_BEARER_TOKEN_4')
    ]
    MAX_TWEETS = 100
    MAX_FOLLOWERS = 1000
    MAX_FOLLOWING = 1000
    MAX_FOLLOWER_SAMPLE = 100
    # path for JSON files is all in /xai-hackathon/server/*.json
    JSON_BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
