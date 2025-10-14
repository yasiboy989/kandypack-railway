from sqlalchemy import Column,Integer,String,DateTime,func
from .database import Base

class User(Base):
    __tablename__ = "user_account"

    user_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer,index=True)
    role_id = Column(Integer,index=True)
    user_name = Column(String, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    last_login = Column(DateTime(timezone=True), onupdate=func.now())

class Role(Base):
    __tablename__ = "role"

    role_id =  Column(Integer, primary_key=True, index=True)
    role_name = Column(String,nullable=False)
    access_rights = Column(String, nullable=False)

class Employee(Base):
    __tablename__ = "employee"

    employee_id = Column(Integer, primary_key=True, index=True)
    employee_type_id = Column(Integer, nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    nic = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    weekly_hours = Column(Integer)
    address = Column(String)
    date_hired = Column(DateTime(timezone=True))
    employment_status = Column(String)