import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import traceback
from x_functions import sample_users_with_tweets_from_username
from x_models import UserWithTweets
import uvicorn
import asyncio
import ast
import tracemalloc
from pydantic import BaseModel, Field
import time
from itertools import cycle

load_dotenv('.env')

app: FastAPI = FastAPI(title="API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROK_API_KEYS = [
    os.getenv("GROK_API_KEY_1"),
    os.getenv("GROK_API_KEY_2"),
    os.getenv("GROK_API_KEY_3"),
    os.getenv("GROK_API_KEY_4")
]
GROK_API_KEY_CYCLE = cycle(GROK_API_KEYS)
GROK_LLM_API_URL = os.getenv("GROK_LLM_API_URL")

if not all(GROK_API_KEYS) or not GROK_LLM_API_URL:
    raise ValueError("All GROK_API_KEYs and GROK_LLM_API_URL must be set in environment variables.")

def parse_input(json_input):
    """
    Parse the JSON input and extract necessary fields.

    Args:
        json_input (dict): The JSON input containing user data and post content.

    Returns:
        tuple: (name, bio, sample_tweets, post_type)
    """
    user = json_input.get('user', {})
    name = user.get('name', '').strip()
    bio = user.get('description', '').strip()
    tweets = json_input.get('tweets', [])
    sample_tweets = [tweet.get('text', '').strip() for tweet in tweets]
    post_type = json_input.get('post_type', '').strip().lower()  # 'text' or 'image'
    return name, bio, sample_tweets, post_type

class GrokImpersonationReply(BaseModel):
    explanation: str = Field(..., description="The explanation of the person's response to the text")
    response: str = Field(..., description="A response tweet, as the user, to the input text")
    agree: bool = Field(..., description="A boolean flag indicating if the user supports the text or not")
    sentiment: float = Field(..., description="A sentiment score of the user's thoughts on the input post. 0 is disagree, 1 is agree.")

async def impersonate_reply(name: str, bio: str, location: str, sample_tweets: list[str], post_content: str) -> GrokImpersonationReply:
    """
    Generate a simulated reply using Grok LLM API based on user information and post content. Cycles through Grok API keys until they're all rate limited!
    """
    sys_prompt = (
        f"""
You are impersonating {name}, a real human person.
To properly impersonate them, here is some information on them:

# DESCRIPTION
"{bio}"

# LOCATION
"{location}"

# SAMPLE TWEETS
{'\n'.join([f'- "{tweet}"' for tweet in sample_tweets])}

# YOUR TASK
You will read and simulate a reply to an input post.

Based on the person's information above, you will response to this post with JSON in this schema:

{json.dumps(GrokImpersonationReply.model_json_schema(), indent=2)} 

Output NOTHING else except for this JSON!
        """
    )

    prompt = f"""
INPUT POST:
{post_content}

IMPERSONATED JSON RESPONSE:
    """

    payload = {
        'messages': [
            {
                "role": "system",
                "content": sys_prompt
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        'model': 'grok-2-mini-public',
        'stream': False
    }

    for _ in range(len(GROK_API_KEYS)):
        current_api_key = next(GROK_API_KEY_CYCLE)
        headers = {
            'Authorization': f'Bearer {current_api_key}',
            'Content-Type': 'application/json'
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(GROK_LLM_API_URL, headers=headers, json=payload, timeout=60)
                response.raise_for_status()
                data = response.json()

            reply = ""
            if 'choices' in data and len(data['choices']) > 0:
                reply = data['choices'][0].get('message', {}).get('content', '').strip()

            if not reply:
                raise ValueError("No reply received from Grok LLM API.")

            reply = reply.replace("```json", "").replace("```", "").strip()
            try:
                reply_json = json.loads(reply)
            except json.JSONDecodeError:
                try:
                    reply_json = ast.literal_eval(reply)
                except (SyntaxError, ValueError):
                    raise ValueError("Failed to parse the reply as JSON or Python literal.")

            validated_reply = GrokImpersonationReply(**reply_json)
            return validated_reply

        except httpx.HTTPStatusError as http_err:
            if http_err.response.status_code == 429:
                print(f"Rate limit exceeded for API key {current_api_key}. Trying next key.")
                continue
            else:
                error_content = http_err.response.text if http_err.response is not None else 'No response content'
                raise HTTPException(
                    status_code=500,
                    detail=f"Grok LLM API HTTP Error: {http_err}\nResponse Content: {error_content}"
                )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Grok LLM API Request Error: {e}"
            )
        except ValueError as ve:
            raise HTTPException(
                status_code=500,
                detail=f"Grok LLM API Response Error: {ve}"
            )

    raise HTTPException(
        status_code=429,
        detail="All Grok API keys have been rate limited. Please try again later."
    )

@app.get("/")
async def root():
    return JSONResponse({"message": "API"})

@app.get("/sample_x")
async def sample_x(username: str, sampling_text: str):
    """
    Given a target username and some sampling text, impersonate the replies of a sample set of the username's followers.
    """
    try:
        start_time = time.time()
        
        sample_response = await sample_users_with_tweets_from_username(username)

        async def process_user(user_with_tweets: UserWithTweets):
            try:
                user_response = await impersonate_reply(
                    user_with_tweets.user.name,
                    user_with_tweets.user.description,
                    user_with_tweets.user.location,
                    user_with_tweets.tweets,
                    sampling_text
                )
                return {
                    "user": user_with_tweets.user.model_dump(),
                    "response": user_response.model_dump()
                }
            except Exception as e:
                print(f"Error processing user {user_with_tweets.user.name}: {str(e)}")

        responses = await asyncio.gather(*[process_user(user) for user in sample_response.samples])
        responses = [r for r in responses if r is not None]
        
        end_time = time.time()
        total_time = int((end_time - start_time) * 1000)
            
        return JSONResponse({
            "samples": responses,
            "sampling_time": sample_response.response_time,
            "total_time": total_time
        })
    except Exception as e:
        traceback_str = ''.join(traceback.format_tb(e.__traceback__))
        error_message = f"Error processing request: {e}\nTraceback: {traceback_str}"
        raise HTTPException(status_code=500, detail=error_message)

if __name__ == "__main__":
    # try:
    #     tracemalloc.start()
    #     uvicorn.run(
    #         "src.api:app", host="0.0.0.0", port=8080, reload=True, lifespan="on"
    #     )
    # except Exception as e:
    #     print(f"Error: {e}")

    # test = asyncio.run(impersonate_reply("Ray", "I love Trump", "Texas", ["Trump is the best! #MAGA", "I hate democrats"], "Kamala harris will win!"))
    # print(test.model_dump())

    test = asyncio.run(sample_x('iporollo', "I love kamala harris"))
    response_content = test.body.decode('utf-8')
    print(json.loads(response_content))
