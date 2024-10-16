import ast
import asyncio
import json
import traceback
import tracemalloc
from typing import Any

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from src.config import GROK_API_KEY_CYCLE, GROK_API_KEYS, GROK_LLM_API_URL
from src.database import Database
from src.middleware import ReferrerCheckMiddleware
from src.prompts import SYSTEM_PROMPT, USER_PROMPT
from src.rate_limiter import limiter
from src.utils.functions import (
    get_user_by_username,
    sample_users_with_tweets_from_username,
)
from src.utils.models import GrokImpersonationReply, UserSampleResponse, UserWithTweets

load_dotenv(".env")

app: FastAPI = FastAPI(title="API", version="1.0.0")

app.add_middleware(ReferrerCheckMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not any(GROK_API_KEYS) or not GROK_LLM_API_URL:
    raise ValueError(
        "Atleast one GROK_API_KEY and GROK_LLM_API_URL must be set in environment variables."
    )


def parse_input(json_input: dict[str, Any]) -> tuple[str, str, list[str], str]:
    """Parse the JSON input and extract necessary fields."""
    user = json_input.get("user", {})
    name = user.get("name", "").strip()
    bio = user.get("description", "").strip()
    tweets = json_input.get("tweets", [])
    sample_tweets = [tweet.get("text", "").strip() for tweet in tweets]
    post_type = json_input.get("post_type", "").strip().lower()  # 'text' or 'image'
    return name, bio, sample_tweets, post_type


async def make_grok_api_request(payload: dict[str, Any]) -> dict[str, Any]:
    """Make a request to the Grok API and handle errors."""
    for _ in range(len(GROK_API_KEYS)):
        current_api_key = next(GROK_API_KEY_CYCLE)
        headers = {
            "Authorization": f"Bearer {current_api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    GROK_LLM_API_URL, headers=headers, json=payload, timeout=60
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as http_err:
            if http_err.response.status_code == 429:
                print(
                    f"Rate limit exceeded for API key {current_api_key}. Trying next key."
                )
                continue
            else:
                error_content = (
                    http_err.response.text
                    if http_err.response
                    else "No response content"
                )
                print(
                    f"Grok LLM API HTTP Error: {http_err}\nResponse Content: {error_content}"
                )
        except httpx.RequestError as e:
            print(f"Grok LLM API Request Error: {e}")

    raise HTTPException(
        status_code=429,
        detail="All Grok API keys have been rate limited. Please try again later.",
    )


async def impersonate_reply(
    name: str, bio: str, location: str, sample_tweets: list[str], post_content: str
) -> GrokImpersonationReply:
    """Generate a simulated reply using Grok LLM API based on user information and post content."""
    system_prompt = SYSTEM_PROMPT(name, bio, location, sample_tweets)
    user_prompt = USER_PROMPT(post_content)

    payload = {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "model": "grok-2-public",
        "stream": False,
        "temperature": 0.9,
    }

    data = await make_grok_api_request(payload)

    reply = ""
    if "choices" in data and len(data["choices"]) > 0:
        reply = data["choices"][0].get("message", {}).get("content", "").strip()

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

    return GrokImpersonationReply(**reply_json)


@limiter.limit("3/minute")
@app.get("/user/{username}")
async def get_user(request: Request, username: str) -> dict[str, Any]:
    """Get user information by username."""
    username = request.path_params.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Missing username query parameter")

    try:
        user = await get_user_by_username(username)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")


@limiter.limit("2/minute")
@app.get("/sample_x")
async def sample_x(request: Request) -> StreamingResponse:
    """Impersonate replies of a sample set of the username's followers."""
    username = request.query_params.get("username")
    sampling_text = request.query_params.get("sampling_text")

    if not username or not sampling_text:
        raise HTTPException(
            status_code=400, detail="Missing username or sampling_text query parameters"
        )

    Database.log_user_usage(username)

    try:
        sample_response: UserSampleResponse = (
            await sample_users_with_tweets_from_username(username)
        )

        async def process_user(user_with_tweets: UserWithTweets) -> dict[str, Any]:
            """Process a single user and generate a response."""
            try:
                user_response = await impersonate_reply(
                    user_with_tweets.user.name,
                    user_with_tweets.user.description,
                    user_with_tweets.user.location,
                    user_with_tweets.tweets,
                    sampling_text,
                )
                return {
                    "user": user_with_tweets.user.model_dump(),
                    "response": user_response.model_dump(),
                }
            except Exception as e:
                print(f"Error processing user {user_with_tweets.user.name}: {str(e)}")
                return None

        async def stream_responses():
            """Stream processed user responses."""
            tasks = [process_user(user) for user in sample_response.samples]
            for result in asyncio.as_completed(tasks):
                processed_result = await result
                if processed_result:
                    yield json.dumps(processed_result) + "\n"

        return StreamingResponse(stream_responses(), media_type="application/json")
    except Exception as e:
        traceback_str = "".join(traceback.format_tb(e.__traceback__))
        error_message = f"Error processing request: {e}\nTraceback: {traceback_str}"
        raise HTTPException(status_code=500, detail=error_message)


if __name__ == "__main__":
    try:
        tracemalloc.start()
        uvicorn.run("api:app", host="0.0.0.0", port=8080, reload=True, lifespan="on")
    except Exception as e:
        print(f"Error: {e}")
    # test = asyncio.run(impersonate_reply("Ray", "I love Trump", "Texas", ["Trump is the best! #MAGA", "I hate democrats"], "Kamala harris will win!"))
    # print(test.model_dump())

    # async def test_sample_x():
    #     response = await sample_x("raydelvecc", "openai is better than x ai")
    #     async for line in response.body_iterator:
    #         result = json.loads(line)
    #         print(result)

    # asyncio.run(test_sample_x())
