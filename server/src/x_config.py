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
    MAX_TWEETS = 50
    MAX_FOLLOWERS = 250
    MAX_FOLLOWING = 250
    MAX_FOLLOWER_SAMPLE = 50
    JSON_BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))  # path for JSON files is in /xai-hackathon/server/*.json
