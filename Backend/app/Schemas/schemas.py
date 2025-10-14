from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    employee_id: int
    role_id: int
    user_name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    user_name: str
    email: EmailStr
    role: str

class UserPorfileUpdate(BaseModel):
    email: EmailStr
    phone: str