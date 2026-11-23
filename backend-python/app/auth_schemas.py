from pydantic import BaseModel


class LoginRequest(BaseModel):
    college_id: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    college_id: str
    name: str
    role: str