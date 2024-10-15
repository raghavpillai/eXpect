from fastapi import HTTPException, Request
from starlette.datastructures import URL
from starlette.middleware.base import BaseHTTPMiddleware

ALLOWED_ORIGINS = [
    "localhost",
    "expect.vercel.app",
    "tryexpect.com",
    "www.tryexpect.com",
]


class ReferrerCheckMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if referer := request.headers.get("Referer"):
            referer_url = URL(referer)
            allowed_origins = ALLOWED_ORIGINS
            if referer_url.hostname not in allowed_origins:
                raise HTTPException(status_code=403, detail="Invalid referer")
        return await call_next(request)
