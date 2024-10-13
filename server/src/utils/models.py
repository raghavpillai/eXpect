from typing import List, Optional

from pydantic import BaseModel, Field


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


class GrokImpersonationReply(BaseModel):
    explanation: str = Field(
        ...,
        description="Concise chain of thought and explanation of how the person's profile should be used to impersonate the input post. 2-3 sentences max.",
    )
    response: str = Field(
        ...,
        description="Impersonated response tweet to the input post in the EXACT style of the person. Stay as true to the style as possible, including grammar, syntax, and word choice.",
    )
    agree: bool = Field(
        ...,
        description="A boolean flag indicating if the person supports the text or not. ALWAYS set to either true or false.",
    )
    sentiment: float = Field(
        ...,
        description="A sentiment score of the person's thoughts on the input post. 0 is disagree, 1 is agree. This should take into account how the person's posts typically lean, not just neutral.",
    )
