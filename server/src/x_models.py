from typing import List, Optional

from pydantic import BaseModel


class User(BaseModel):
    id: str
    name: str
    username: str
    description: Optional[str]
    location: Optional[str]
    image_url: Optional[str]


class UserWithTweets(BaseModel):
    user: User
    tweets: List[str]


class UserSampleResponse(BaseModel):
    samples: List[UserWithTweets]
    response_time: int
