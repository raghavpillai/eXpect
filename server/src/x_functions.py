import asyncio
import json
import os
import random
import time
from typing import List

from x_config import Config
from x_models import User, UserSampleResponse, UserWithTweets
from x_x import (
    get_user_by_username,
    get_user_followers,
    get_user_following,
    get_user_tweets,
)


async def get_user_with_tweets(
    username: str, save_sample: bool = False
) -> UserWithTweets:
    """
    Returns an object containing a user and their tweets.
    """
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
        tweets = []
        if tweets_data and "data" in tweets_data:
            tweets = [tweet.get("text", "") for tweet in tweets_data["data"] if tweet]

        user_with_tweets = UserWithTweets(user=user, tweets=tweets)

        if save_sample:
            sample_dump = user_with_tweets.model_dump()
            json_path = os.path.join(Config.JSON_BASE_PATH, "SAMPLE.json")
            with open(json_path, "w") as f:
                json.dump(sample_dump, f, indent=4)

        return user_with_tweets
    except Exception as e:
        print(f"Error in get_user_with_tweets: {str(e)}")
        return None


async def sample_user_followers(
    user_id: str, max_sample: int = Config.MAX_FOLLOWER_SAMPLE
) -> List[dict]:
    """
    Given a user id, get all the user objects that the user BOTH follows and has following them. If there is no intersection, we randomly sample
    max_sample followers.
    """
    try:
        followers, following = await asyncio.gather(
            get_user_followers(user_id), get_user_following(user_id)
        )

        if (
            not followers
            or "data" not in followers
            or not following
            or "data" not in following
        ):
            return []

        follower_ids = set(
            user["id"] for user in followers["data"] if user and "id" in user
        )
        following_ids = set(
            user["id"] for user in following["data"] if user and "id" in user
        )

        intersect_ids = follower_ids.intersection(following_ids)

        intersect_users = [
            user
            for user in followers["data"]
            if user and "id" in user and user["id"] in intersect_ids
        ]

        if intersect_users:
            sample = random.sample(
                intersect_users, min(len(intersect_users), max_sample)
            )
            if len(sample) < max_sample:
                remaining_users = [
                    user for user in followers["data"] if user not in intersect_users
                ]
                additional_sample = random.sample(
                    remaining_users, min(len(remaining_users), max_sample - len(sample))
                )
                sample.extend(additional_sample)
            return sample
        else:
            return random.sample(
                followers["data"], min(len(followers["data"]), max_sample)
            )
    except Exception as e:
        print(f"Error in sample_user_followers: {str(e)}")
        return []


async def sample_users_with_tweets_from_username(
    username: str, save_sample: bool = False
) -> UserSampleResponse:
    """
    Given a username whose followers you want to sample, construct a list of the follower profiles complete with tweets.
    Optionally dump the result to a JSON file.
    """
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

        async def get_user_tweets(follower):
            if follower and "username" in follower:
                return await get_user_with_tweets(follower["username"])
            return None

        user_with_tweets_list = await asyncio.gather(
            *[get_user_tweets(follower) for follower in sample]
        )
        user_with_tweets_list = [
            uwt for uwt in user_with_tweets_list if uwt is not None
        ]

        end_time = time.time()
        response_time = int((end_time - start_time) * 1000)

        sample_response = UserSampleResponse(
            samples=user_with_tweets_list, response_time=response_time
        )

        if save_sample:
            json_path = os.path.join(
                Config.JSON_BASE_PATH, f"follower_samples_with_tweets_{username}.json"
            )
            with open(json_path, "w") as f:
                json.dump(sample_response.model_dump(), f, indent=4)

        return sample_response
    except Exception as e:
        print(f"Error in sample_users_with_tweets_from_username: {str(e)}")
        return UserSampleResponse(samples=[], response_time=0)


if __name__ == "__main__":
    asyncio.run(sample_users_with_tweets_from_username("raydelvecc"))
