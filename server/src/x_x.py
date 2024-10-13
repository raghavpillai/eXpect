import json
import os

import httpx
from x_config import Config
from x_utils import print_rate_limits, save_to_json


async def call_api_with_retry(url, params=None, headers=None, printLimits=False):
    """
    Calls the API with all bearer tokens and returns results if successful.
    """
    try:
        print(f"CALLING {url}...")

        if headers is None:
            headers = {}

        async with httpx.AsyncClient() as client:
            for i in range(len(Config.BEARER_TOKENS)):
                try:
                    bearer_token = Config.BEARER_TOKENS[i]
                    headers["Authorization"] = f"Bearer {bearer_token}"

                    response = await client.get(url, headers=headers, params=params)

                    if printLimits:
                        print_rate_limits(response.headers)

                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 429:
                        print_rate_limits(response.headers)
                        print("RATE LIMIT EXCEEDED. TRYING NEXT TOKEN!")
                        Config.BEARER_TOKENS = (
                            Config.BEARER_TOKENS[i + 1 :]
                            + Config.BEARER_TOKENS[: i + 1]
                        )  # shift the 429'd token to the end of the list
                    else:
                        print(f"Error: {response.status_code}")
                        print(response.text)
                except Exception:
                    continue

        print("All bearer tokens exhausted without success.")
    except Exception:
        pass
    return None


async def get_user_by_username(username):
    """
    Gets the user by their username. Returns their ID, description, name, and location.
    """
    try:
        json_path = os.path.join(Config.JSON_BASE_PATH, "users.json")
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                cached_data = json.load(f)
                if username in cached_data:
                    return cached_data[username]

        url = f"https://api.x.com/2/users/by/username/{username}"
        params = {"user.fields": "description,location,profile_image_url"}

        data = await call_api_with_retry(url, params=params)

        if data:
            save_to_json(json_path, username, data)

        return data
    except Exception:
        return None


async def get_user_tweets(user_id, max_tweets: int = Config.MAX_TWEETS):
    """
    Gets list of tweets a user has made, excluding replies and retweets. Takes the sensitive tag and the tweet's text.
    """
    try:
        json_path = os.path.join(Config.JSON_BASE_PATH, "user_tweets.json")
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                cached_data = json.load(f)
                if str(user_id) in cached_data:
                    return cached_data[str(user_id)]

        url = f"https://api.x.com/2/users/{user_id}/tweets"
        params = {
            "tweet.fields": "text",
            "exclude": "replies,retweets",
            "max_results": max_tweets,
        }
        headers = {"User-Agent": "v2UserTweetsPython"}

        data = await call_api_with_retry(url, params=params, headers=headers)

        if data:
            save_to_json(json_path, str(user_id), data)

        return data
    except Exception:
        return None


async def get_user_followers(user_id, max_followers: int = Config.MAX_FOLLOWERS):
    """
    Gets list of followers for a given user ID. Returns up to 1000 followers.
    """
    try:
        json_path = os.path.join(Config.JSON_BASE_PATH, "user_followers.json")
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                cached_data = json.load(f)
                if str(user_id) in cached_data:
                    return cached_data[str(user_id)]

        url = f"https://api.x.com/2/users/{user_id}/followers"
        params = {"max_results": max_followers}
        headers = {"User-Agent": "v2UserFollowersPython"}

        data = await call_api_with_retry(url, params=params, headers=headers)

        if data:
            save_to_json(json_path, str(user_id), data)

        return data
    except Exception:
        return None


async def get_user_following(user_id, max_following: int = Config.MAX_FOLLOWING):
    """
    Gets list of users a given user ID is following. Returns up to 1000 users.
    """
    try:
        json_path = os.path.join(Config.JSON_BASE_PATH, "user_following.json")
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                cached_data = json.load(f)
                if str(user_id) in cached_data:
                    return cached_data[str(user_id)]

        url = f"https://api.x.com/2/users/{user_id}/following"
        params = {"max_results": max_following}
        headers = {"User-Agent": "v2UserFollowingPython"}

        data = await call_api_with_retry(url, params=params, headers=headers)

        if data:
            save_to_json(json_path, str(user_id), data)

        return data
    except Exception:
        return None
