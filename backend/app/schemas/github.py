from pydantic import BaseModel


class GithubLink(BaseModel):
    access_token: str
    github_username: str


class GithubLinkResponse(BaseModel):
    message: str
    username: str
