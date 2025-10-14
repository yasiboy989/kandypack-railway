from fastapi import FastAPI,Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from jose import JWTError, jwt 
from datetime import timedelta
from sqlalchemy.orm import Session
from Database import database,models,schemas
from Authenticaton import auth
from datetime import datetime

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")



def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=auth.ALGORITHM)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.user_name == username).first()

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    return user

@app.post("/users/create")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter((models.User.user_name == user.user_name) | (models.User.email == user.email)).first()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "Username or email already exists")
    
    hashed_pw = auth.get_password_hash(user.password)

    user_id = len(db.query(models.User).all())+1

    new_user = models.User(
        user_id = user_id,
        employee_id = user.employee_id,
        role_id = user.role_id,
        user_name = user.user_name,
        email = user.email,
        password_hash = hashed_pw,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "user_id": new_user.user_id}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends() ,db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_name == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "Invalid credentials")
    
    access_token_expires = timedelta(minutes=30)
    access_token = auth.create_access_token(data={"sub":user.user_name, "user_id": user.user_id, "role_id": user.role_id},expires_delta=access_token_expires)

    user.last_login = datetime.now()
    db.commit()

    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout():
    return

@app.get("/auth/profile", response_model = schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = db.query(models.Role).filter(models.Role.role_id == current_user.role_id).first()
    return {
        "user_id": current_user.user_id,
        "user_name": current_user.user_name,
        "email": current_user.email,
        "role": role.role_name
    }
