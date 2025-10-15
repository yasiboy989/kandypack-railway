from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    role: str
    password: str
    employee_id: int

class UserResponse(BaseModel):
    user_id: int
    user_name: str
    email: EmailStr
    role: str

class UserPorfileUpdate(BaseModel):
    email: EmailStr
    phone: str