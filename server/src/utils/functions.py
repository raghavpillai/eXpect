import asyncio
import random
import time
from typing import Any

from src.config import MAX_FOLLOWER_SAMPLE
from src.database import Database
from src.utils.models import User, UserSampleResponse, UserWithTweets
from src.utils.x import (
    get_user_by_username,
    get_user_followers,
    get_user_following,
    get_user_tweets,
)


async def get_user_with_tweets(
    username: str, save_sample: bool = False
) -> UserWithTweets | None:
    """Fetches user data and tweets, optionally saving the sample."""
    try:
        user_data = await get_user_by_username(username)
        if not user_data or "data" not in user_data:
            return None

        user_info = user_data["data"]
        user = User(
            id=user_info.get("id", ""),
            name=user_info.get("name", ""),
            username=user_info.get("username", ""),
            description=user_info.get("description", ""),
            location=user_info.get("location", ""),
            image_url=user_info.get("profile_image_url", ""),
        )

        tweets_data = await get_user_tweets(user.id)
        tweets = [
            tweet.get("text", "") for tweet in tweets_data.get("data", []) if tweet
        ]

        user_with_tweets = UserWithTweets(user=user, tweets=tweets)

        if save_sample:
            Database.save_cached_data(
                "samples", username, user_with_tweets.model_dump()
            )

        return user_with_tweets
    except Exception as e:
        print(f"Error in get_user_with_tweets: {str(e)}")
        return None


async def sample_user_followers(
    user_id: str, max_sample: int = MAX_FOLLOWER_SAMPLE
) -> list[dict[str, Any]]:
    """Samples followers of a user, prioritizing mutual follows."""
    try:
        followers, following = await asyncio.gather(
            get_user_followers(user_id), get_user_following(user_id)
        )

        if not _validate_user_data(followers, following):
            return []

        follower_ids, following_ids = _extract_user_ids(followers, following)
        intersect_ids = follower_ids.intersection(following_ids)

        intersect_users = [
            user
            for user in followers["data"]
            if user and "id" in user and user["id"] in intersect_ids
        ]

        sample = _get_random_sample(intersect_users, max_sample)

        if len(sample) < max_sample:
            remaining_users = [
                user for user in followers["data"] if user not in intersect_users
            ]
            additional_sample = _get_random_sample(
                remaining_users, max_sample - len(sample)
            )
            sample.extend(additional_sample)

        return sample
    except Exception as e:
        print(f"Error in sample_user_followers: {str(e)}")
        return []


def _validate_user_data(followers: dict[str, Any], following: dict[str, Any]) -> bool:
    """Validates the structure of user data."""
    return followers and following and "data" in followers and "data" in following


def _extract_user_ids(
    followers: dict[str, Any], following: dict[str, Any]
) -> tuple[set[str], set[str]]:
    """Extracts user IDs from followers and following data."""
    follower_ids = {user["id"] for user in followers["data"] if user and "id" in user}
    following_ids = {user["id"] for user in following["data"] if user and "id" in user}
    return follower_ids, following_ids


def _get_random_sample(
    users: list[dict[str, Any]], sample_size: int
) -> list[dict[str, Any]]:
    """Returns a random sample of users."""
    return random.sample(users, min(len(users), sample_size))


async def sample_users_with_tweets_from_username(
    username: str, save_sample: bool = False
) -> UserSampleResponse:
    """Samples followers of a user and fetches their tweets."""
    start_time = time.time()

    try:
        user_info = await get_user_by_username(username)
        if not user_info or "data" not in user_info:
            print(f"User {username} not found.")
            return UserSampleResponse(samples=[], response_time=0)

        user_id = user_info["data"].get("id")
        if not user_id:
            print(f"User ID not found for {username}.")
            return UserSampleResponse(samples=[], response_time=0)

        sample = await sample_user_followers(user_id)

        async def get_user_tweets(follower: dict[str, Any]) -> UserWithTweets | None:
            if follower and "username" in follower:
                return await get_user_with_tweets(follower["username"])
            return None

        user_with_tweets_list = [
            uwt
            for uwt in await asyncio.gather(*map(get_user_tweets, sample))
            if uwt is not None
        ]

        response_time = int((time.time() - start_time) * 1000)

        sample_response = UserSampleResponse(
            samples=user_with_tweets_list, response_time=response_time
        )

        if save_sample:
            Database.save_cached_data(
                "follower_samples", username, sample_response.model_dump()
            )

        return sample_response
    except Exception as e:
        print(f"Error in sample_users_with_tweets_from_username: {str(e)}")
        return UserSampleResponse(samples=[], response_time=0)


if __name__ == "__main__":
    asyncio.run(sample_users_with_tweets_from_username("raydelvecc"))
