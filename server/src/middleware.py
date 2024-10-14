from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.datastructures import URL

ALLOWED_ORIGINS = ["localhost", "expect.vercel.app"]

class ReferrerCheckMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        referer = request.headers.get("Referer")
        if referer:
            referer_url = URL(referer)
            allowed_origins = ALLOWED_ORIGINS
            if referer_url.hostname not in allowed_origins:
                raise HTTPException(status_code=403, detail="Invalid referer")
        return await call_next(request)
