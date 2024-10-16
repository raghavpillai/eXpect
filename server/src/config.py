import os
from itertools import cycle

from dotenv import load_dotenv


class EnvConfig:
    def __init__(self):
        load_dotenv(".env")  # Note: doesn't overwrite existing env vars in your shell

    def __call__(self, env_var_name: str, default: any = None) -> any:
        return os.environ.get(env_var_name, default)


config: EnvConfig = EnvConfig()

BEARER_TOKENS: list[str] = [
    token for token in [
        config("X_BEARER_TOKEN_1"),
        config("X_BEARER_TOKEN_2"),
        config("X_BEARER_TOKEN_3"),
        config("X_BEARER_TOKEN_4"),
    ] if token is not None
]
MAX_TWEETS: int = config("MAX_TWEETS", 50)
MAX_FOLLOWERS: int = config("MAX_FOLLOWERS", 500)
MAX_FOLLOWING: int = config("MAX_FOLLOWING", 500)
MAX_FOLLOWER_SAMPLE: int = config("MAX_FOLLOWER_SAMPLE", 50)

GROK_API_KEYS: list[str] = [
    key for key in [
        config("GROK_API_KEY_1"),
        config("GROK_API_KEY_2"),
        config("GROK_API_KEY_3"),
        config("GROK_API_KEY_4"),
    ] if key is not None
]
GROK_API_KEY_CYCLE: cycle = cycle(GROK_API_KEYS)
GROK_LLM_API_URL: str = config("GROK_LLM_API_URL")

MONGODB_URI: str = config("MONGODB_URI")

if not any(BEARER_TOKENS) or not any(GROK_API_KEYS) or not GROK_LLM_API_URL:
    raise ValueError(
        "At least one X_BEARER_TOKEN, one GROK_API_KEY, and GROK_LLM_API_URL must be set in environment variables."
    )
