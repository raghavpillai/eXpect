import socketio

# import tracemalloc
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.socket_manager import initialize_socket

"""
FASTAPI APP
"""

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

"""
ENDPOINTS
"""


@app.get("/")
async def root():
    return JSONResponse({"message": "API"})


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
    except Exception:
        pass
