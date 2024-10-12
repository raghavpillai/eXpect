import httpx
import json
import asyncio
import os
from config import Config
from utils import print_rate_limits, save_to_json

async def call_api_with_retry(url, params=None, headers=None, printLimits=False):
    """
    Calls the API with all bearer tokens and returns results if successful.
    """
    print(f"CALLING {url}...")

    if headers is None:
        headers = {}

    async with httpx.AsyncClient() as client:
        for bearer_token in Config.BEARER_TOKENS:
            headers['Authorization'] = f'Bearer {bearer_token}'
            
            response = await client.get(url, headers=headers, params=params)

            if printLimits:
                print_rate_limits(response.headers)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                print_rate_limits(response.headers)
                print("RATE LIMIT EXCEEDED. TRYING NEXT TOKEN!")
            else:
                print(f"Error: {response.status_code}")
                print(response.text)

    print("All bearer tokens exhausted without success.")
    return None

async def get_user_by_username(username):
    """
    Gets the user by their username. Returns their ID, description, name, and location. 
    """
    if os.path.exists('users.json'):
        with open('users.json', 'r') as f:
            cached_data = json.load(f)
            if username in cached_data:
                return cached_data[username]

    url = f'https://api.x.com/2/users/by/username/{username}'
    params = {
        'user.fields': 'description,location'
    }
    
    data = await call_api_with_retry(url, params=params)
    
    if data:
        save_to_json('users.json', username, data)
    
    return data

async def get_user_tweets(user_id, max_tweets: int = Config.MAX_TWEETS):
    """
    Gets list of tweets a user has made, excluding replies and retweets. Takes the sensitive tag and the tweet's text.
    """
    if os.path.exists('user_tweets.json'):
        with open('user_tweets.json', 'r') as f:
            cached_data = json.load(f)
            if str(user_id) in cached_data:
                return cached_data[str(user_id)]

    url = f"https://api.x.com/2/users/{user_id}/tweets"
    params = {
        "tweet.fields": "text",
        "exclude": "replies,retweets",
        "max_results": max_tweets
    }
    headers = {'User-Agent': 'v2UserTweetsPython'}
    
    data = await call_api_with_retry(url, params=params, headers=headers)
    
    if data:
        save_to_json('user_tweets.json', str(user_id), data)
    
    return data

async def get_user_followers(user_id, max_followers: int = Config.MAX_FOLLOWERS):
    """
    Gets list of followers for a given user ID. Returns up to 1000 followers.
    """
    if os.path.exists('user_followers.json'):
        with open('user_followers.json', 'r') as f:
            cached_data = json.load(f)
            if str(user_id) in cached_data:
                return cached_data[str(user_id)]

    url = f"https://api.x.com/2/users/{user_id}/followers"
    params = {
        "max_results": max_followers
    }
    headers = {'User-Agent': 'v2UserFollowersPython'}
    
    data = await call_api_with_retry(url, params=params, headers=headers)
    
    if data:
        save_to_json('user_followers.json', str(user_id), data)
    
    return data

async def get_user_following(user_id, max_following: int = Config.MAX_FOLLOWING):
    """
    Gets list of users a given user ID is following. Returns up to 1000 users.
    """
    if os.path.exists('user_following.json'):
        with open('user_following.json', 'r') as f:
            cached_data = json.load(f)
            if str(user_id) in cached_data:
                return cached_data[str(user_id)]

    url = f"https://api.x.com/2/users/{user_id}/following"
    params = {
        "max_results": max_following
    }
    headers = {'User-Agent': 'v2UserFollowingPython'}
    
    data = await call_api_with_retry(url, params=params, headers=headers)
    
    if data:
        save_to_json('user_following.json', str(user_id), data)
    
    return data
