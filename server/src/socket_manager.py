import socketio
from fastapi import FastAPI

sio: socketio.AsyncServer = None


def initialize_socket(fastapi_app: FastAPI) -> socketio.AsyncServer:
    global sio
    sio = socketio.AsyncServer(
        cors_allowed_origins="*",
        async_mode="asgi",
        max_http_buffer_size=100_000_000,
    )
    socket_app = socketio.ASGIApp(socketio_server=sio)
    fastapi_app.mount("/socket.io", socket_app)
    return sio


def get_socket() -> socketio.AsyncServer:
    global sio
    if not sio:
        raise ValueError("Socket not initialized")
    return sio
