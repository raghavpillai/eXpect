import httpx
from src.config import (
    BEARER_TOKENS,
    MAX_FOLLOWERS,
    MAX_FOLLOWING,
    MAX_TWEETS,
)
from src.database import Database
from src.utils.utils import print_rate_limits


async def call_api_with_retry(url, params=None, headers=None, printLimits=False):
    """
    Calls the API with all bearer tokens and returns results if successful.
    """
    try:
        print(f"CALLING {url}...")

        if headers is None:
            headers = {}

        async with httpx.AsyncClient() as client:
            for i in range(len(BEARER_TOKENS)):
                try:
                    bearer_token = BEARER_TOKENS[i]
                    headers["Authorization"] = f"Bearer {bearer_token}"

                    response = await client.get(url, headers=headers, params=params)

                    if printLimits:
                        print_rate_limits(response.headers)

                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 429:
                        print_rate_limits(response.headers)
                        print("RATE LIMIT EXCEEDED. TRYING NEXT TOKEN!")
                        BEARER_TOKENS = (
                            BEARER_TOKENS[i + 1 :] + BEARER_TOKENS[: i + 1]
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
        username = username.lstrip("@")

        cached_data = Database.get_cached_data("users", username)
        if cached_data:
            return cached_data

        url = f"https://api.x.com/2/users/by/username/{username}"
        params = {"user.fields": "description,location,profile_image_url"}

        data = await call_api_with_retry(url, params=params)

        if data:
            Database.save_cached_data("users", username, data)

        return data
    except Exception:
        return None


async def get_user_tweets(user_id, max_tweets: int = MAX_TWEETS):
    """
    Gets list of tweets a user has made, excluding replies and retweets. Takes the sensitive tag and the tweet's text.
    """
    try:
        cached_data: dict | None = Database.get_cached_data("user_tweets", str(user_id))
        if cached_data:
            return cached_data

        url = f"https://api.x.com/2/users/{user_id}/tweets"
        params = {
            "tweet.fields": "text",
            "exclude": "replies,retweets",
            "max_results": max_tweets,
        }
        headers = {"User-Agent": "v2UserTweetsPython"}

        data = await call_api_with_retry(url, params=params, headers=headers)

        if data:
            Database.save_cached_data("user_tweets", str(user_id), data)

        return data
    except Exception:
        return None


async def get_user_followers(user_id, max_followers: int = MAX_FOLLOWERS):
    """
    Gets list of followers for a given user ID. Returns up to 1000 followers.
    """
    try:
        cached_data = Database.get_cached_data("user_followers", str(user_id))
        if cached_data:
            return cached_data

        url = f"https://api.x.com/2/users/{user_id}/followers"
        params = {"max_results": max_followers}
        headers = {"User-Agent": "v2UserFollowersPython"}

        data = await call_api_with_retry(url, params=params, headers=headers)

        if data:
            Database.save_cached_data("user_followers", str(user_id), data)

        return data
    except Exception:
        return None


async def get_user_following(user_id, max_following: int = MAX_FOLLOWING):
    """
    Gets list of users a given user ID is following. Returns up to 1000 users.
    """
    try:
        cached_data = Database.get_cached_data("user_following", str(user_id))
        if cached_data:
            return cached_data

        url = f"https://api.x.com/2/users/{user_id}/following"
        params = {"max_results": max_following}
        headers = {"User-Agent": "v2UserFollowingPython"}

        data = await call_api_with_retry(url, params=params, headers=headers)

        if data:
            Database.save_cached_data("user_following", str(user_id), data)

        return data
    except Exception:
        return None
