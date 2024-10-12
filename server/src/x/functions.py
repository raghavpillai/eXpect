from typing import List
from models import User, UserWithTweets
from x import get_user_by_username, get_user_tweets, get_user_followers, get_user_following
import json
import random
import asyncio
import time
from config import Config

async def get_user_with_tweets(username: str, save_sample: bool = False) -> UserWithTweets:
    """
    Returns an object containing a user and their tweets.
    """
    user_data = await get_user_by_username(username)
    if not user_data or 'data' not in user_data:
        raise ValueError(f"User {username} not found")

    user_info = user_data['data']
    user = User(
        id=user_info['id'],
        name=user_info['name'],
        username=user_info['username'],
        description=user_info.get('description'),
        location=user_info.get('location')
    )

    tweets_data = await get_user_tweets(user.id)
    tweets = []
    if tweets_data and 'data' in tweets_data:
        for tweet in tweets_data['data']:
            tweets.append(tweet['text'])

    user_with_tweets = UserWithTweets(user=user, tweets=tweets)
    
    if save_sample:
        sample_dump = user_with_tweets.model_dump()
        with open('SAMPLE.json', 'w') as f:
            json.dump(sample_dump, f, indent=4)

    return user_with_tweets

async def sample_user_followers(user_id: str, max_sample: int = Config.MAX_FOLLOWER_SAMPLE) -> List[dict]:
    """
    Given a user id, get all the user objects that the user BOTH follows and has following them. If there is no intersection, we randomly sample
    max_sample followers.
    """
    followers, following = await asyncio.gather(
        get_user_followers(user_id),
        get_user_following(user_id)
    )

    if not followers or 'data' not in followers or not following or 'data' not in following:
        return []

    follower_ids = set(user['id'] for user in followers['data'])
    following_ids = set(user['id'] for user in following['data'])

    intersect_ids = follower_ids.intersection(following_ids)

    intersect_users = [user for user in followers['data'] if user['id'] in intersect_ids]

    if intersect_users:
        return random.sample(intersect_users, min(len(intersect_users), max_sample))
    else:
        return random.sample(followers['data'], min(len(followers['data']), max_sample))

async def sample_users_with_tweets_from_username(username: str, save_sample: bool = True) -> List[UserWithTweets]:
    """
    Given a username whose followers you want to sample, construct a list of the follower profiles complete with tweets.
    Optionally dump the result to a JSON file.
    """
    start_time = time.time()

    user_info = await get_user_by_username(username)
    if not user_info or 'data' not in user_info:
        print(f"User {username} not found.")
        return []

    user_id = user_info['data']['id']
    sample = await sample_user_followers(user_id)
    
    async def get_user_tweets(follower):
        return await get_user_with_tweets(follower['username'])
    
    user_with_tweets_list = await asyncio.gather(*[get_user_tweets(follower) for follower in sample])
    
    if save_sample:
        with open(f'follower_samples_with_tweets_{username}.json', 'w') as f:
            json.dump([uwt.model_dump() for uwt in user_with_tweets_list], f, indent=4)
    
    end_time = time.time()
    print(f"Total time taken to sample followers with tweets: {end_time - start_time:.2f} seconds")
    
    return user_with_tweets_list

if __name__ == "__main__":
    print(asyncio.run(sample_users_with_tweets_from_username('anjanbharadwaj_')))
