import socketio
import os
import json
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.socket_manager import initialize_socket
from dotenv import load_dotenv
import traceback

"""
FASTAPI APP
"""

load_dotenv('.env.local')

app: FastAPI = FastAPI(title="API", version="1.0.0")
sio: socketio.AsyncServer = initialize_socket(app)

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
GROK_API_KEY = os.getenv("GROK_API_KEY")
GROK_LLM_API_URL = os.getenv("GROK_LLM_API_URL")

if not GROK_API_KEY or not GROK_LLM_API_URL:
    raise ValueError("GROK_API_KEY and GROK_LLM_API_URL must be set in environment variables.")

# Helper functions
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

def generate_reply(name, bio, sample_tweets, post_content):
    """
    Generate a simulated reply using Grok LLM API based on user information and post content.
    """
    # Construct the prompt
    prompt = (
        f"""
            You are impersonating {name}, a real human person.
            To properly impersonate them, here is some information on them:

            # BIO
            "{bio}"

            # SAMPLE TWEETS
            {' | '.join(sample_tweets)}

            # YOUR TASK
            Read and simulate a reply to the following input text/post:
            "{post_content}".

            Based on their beliefs, personality, and writing style:
                1. Thoughts: Formulate your unfiltered thoughts to the input text.
                2. Response: write an unfiltered response tweet to the input text.
                3. Agree or Disagree: decide if you agree or disagree with the input text.
        """
    )

    headers = {
        'Authorization': f'Bearer {GROK_API_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'messages': [
            {
                "role": "system",
                "content": "You are a helpful impersonation assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        'model': 'grok-preview',
        'stream': False,
        'temperature': 0.7
    }

    try:
        response = requests.post(GROK_LLM_API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()

        # Extract the reply from the response
        reply = ""
        if 'choices' in data and len(data['choices']) > 0:
            reply = data['choices'][0].get('message', {}).get('content', '').strip()

        if not reply:
            raise ValueError("No reply received from Grok LLM API.")

        return reply
    except requests.exceptions.HTTPError as http_err:
        # Capture response content if available
        error_content = response.text if response is not None else 'No response content'
        raise HTTPException(
            status_code=500,
            detail=f"Grok LLM API HTTP Error: {http_err}\nResponse Content: {error_content}"
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Grok LLM API Request Error: {e}"
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=500,
            detail=f"Grok LLM API Response Error: {ve}"
        )

"""
ENDPOINTS
"""

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

        reply = generate_reply(name, bio, sample_tweets, post_content)

        return JSONResponse({"reply": reply})
    except HTTPException as http_exc:
        # Re-raise the HTTPException without modifying it
        raise http_exc

    except Exception as e:
        # Handle other exceptions
        traceback_str = ''.join(traceback.format_tb(e.__traceback__))
        error_message = f"Error processing request: {e}\nTraceback: {traceback_str}"
        raise HTTPException(status_code=500, detail=error_message)

@sio.on("connect")
async def connect(socket_id: str):
    pass

@sio.on("disconnect")
async def disconnect(socket_id: str):
    pass


if __name__ == "__main__":
    import tracemalloc
    import uvicorn

    try:
        tracemalloc.start()
        uvicorn.run(
            "src.api:app", host="0.0.0.0", port=8080, reload=True, lifespan="on"
        )
    except Exception as e:
        print(f"Error: {e}")
