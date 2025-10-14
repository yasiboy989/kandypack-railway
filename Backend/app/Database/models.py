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
    role_name = Column(String, index=True,nullable=False)
    access_rights = Column(String, index=True, nullable=False)