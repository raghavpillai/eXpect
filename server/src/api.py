import os
import json
import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import traceback
from x_functions import sample_users_with_tweets_from_username
import uvicorn
import asyncio
import ast
import tracemalloc
from pydantic import BaseModel, Field

load_dotenv('.env')

app: FastAPI = FastAPI(title="API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_LLM_API_URL = os.getenv("GROK_LLM_API_URL")

if not GROK_API_KEY or not GROK_LLM_API_URL:
    raise ValueError("GROK_API_KEY and GROK_LLM_API_URL must be set in environment variables.")

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

async def generate_reply(name: str, bio: str, location: str, sample_tweets: list[str], post_content: str) -> GrokImpersonationReply:
    """
    Generate a simulated reply using Grok LLM API based on user information and post content.
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

    headers = {
        'Authorization': f'Bearer {GROK_API_KEY}',
        'Content-Type': 'application/json'
    }
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
        'model': 'grok-preview',
        'stream': False
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
        error_content = response.text if response is not None else 'No response content'
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

@app.get("/")
async def root():
    return JSONResponse({"message": "API"})

@app.post("/generate_reply")
async def generate_reply_endpoint(request: Request):
    """
    Endpoint to generate a reply using Grok LLM API.
    
    Expects JSON input with user data and post content.
    """
    try:
        json_input = await request.json()
        post_content = json_input.get("post_content", "").strip()

        if not post_content:
            raise HTTPException(status_code=400, detail="post_content is required.")

        name, bio, sample_tweets, post_type = parse_input(json_input)

        reply = await generate_reply(name, bio, sample_tweets, post_content)

        return JSONResponse({"reply": reply})
    except HTTPException as http_exc:
        raise http_exc

    except Exception as e:
        traceback_str = ''.join(traceback.format_tb(e.__traceback__))
        error_message = f"Error processing request: {e}\nTraceback: {traceback_str}"
        raise HTTPException(status_code=500, detail=error_message)

@app.get("/sample_x")
async def sample_x(username: str):
    """
    Endpoint to sample users with tweets from a given username.
    """
    try:
        result = await sample_users_with_tweets_from_username(username)
        return JSONResponse(result.model_dump())
    except Exception as e:
        traceback_str = ''.join(traceback.format_tb(e.__traceback__))
        error_message = f"Error processing request: {e}\nTraceback: {traceback_str}"
        raise HTTPException(status_code=500, detail=error_message)

if __name__ == "__main__":
    try:
        tracemalloc.start()
        uvicorn.run(
            "src.api:app", host="0.0.0.0", port=8080, reload=True, lifespan="on"
        )
    except Exception as e:
        print(f"Error: {e}")
