from pydantic import BaseModel, EmailStr
from datetime import date

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

class Role(BaseModel):
    role_id: int
    role_name: str
    accessRights: str

class createRole(BaseModel):
    role_name: str
    accessRights: str

class Employee(BaseModel):
    employee_id: int
    firstName: str
    lastName: str
    type: str

class CreateEmployee(BaseModel):
    firstName: str
    lastName: str
    employeeTypeId: int
    nic: str
    phone: str
    address: str
    dateHired: date

class EmployeeShedules(BaseModel):
    sheduleId: int
    employeeId: int
    deliveryId: int
    hoursWorked: float

class CreateEmployeeSchedule(BaseModel):
    employeeId: int
    deliveryId: int
    hoursWorked: float

class Cutomer(BaseModel):
    customer_id: int
    name: str
    city: str