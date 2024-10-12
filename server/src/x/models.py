from pydantic import BaseModel
from typing import List, Optional

class User(BaseModel):
    id: str
    name: str
    username: str
    description: Optional[str]
    location: Optional[str]

class UserWithTweets(BaseModel):
    user: User
    tweets: List[str]
    