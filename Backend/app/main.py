from fastapi import FastAPI,Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from jose import JWTError, jwt 
from datetime import timedelta
from Database import database
from Authenticaton import auth
from datetime import datetime
from passlib.context import CryptContext

from Schemas import schemas

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=auth.ALGORITHM)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT * FROM user_account where user_name = %s", (username,))

        user = cur.fetchone()

        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.post("/auth/login", tags=["Authentication"])
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT user_id,employee_id, role_id,user_name, password_hash FROM user_account where user_name = %s",(form_data.username,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username or password")
        
        user_id, employee_id, role_id, username, password_hash = user

        if not auth.verify_password(form_data.password,password_hash):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid username or password")
        
        access_token_expires = timedelta(minutes=30)
        access_token = auth.create_access_token(
            data={"sub": username, "user_id": user_id, "employee_id": employee_id, "role_id":role_id},
            expires_delta=access_token_expires
        )

        return {"access_token":access_token, "token_type": "bearer"}
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT, tags = ["Authentication"])
def logout():
    return

@app.get("/auth/profile", response_model=schemas.UserResponse, tags=["Authentication"])
def get_profile(current_user: list = Depends(get_current_user)):

    user_id = current_user[0]
    role_id = current_user[2]
    username = current_user[3]
    email = current_user[5]

    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s",(role_id,))
        role = cur.fetchone()

        return{
            "user_id": user_id,
            "user_name": username,
            "email": email,
            "role": role[0]
        }
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.put("/auth/profile", response_model=schemas.UserResponse, tags=["Authentication"])
def update_profile(profile: schemas.UserPorfileUpdate, current_user: list = Depends(get_current_user)):
    user_id = current_user[0]
    role_id = current_user[2]
    username = current_user[3]
    email = current_user[5]
    employee_id = current_user[1]

    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("UPDATE user_account SET email= %s WHERE user_id=%s RETURNING user_id",(email, user_id,))
        updated = cur.fetchone()
        conn.commit()

        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        cur.execute("UPDATE employee SET phone= %s WHERE employee_id=%s RETURNING employee_id",(profile.phone, employee_id,))
        updated = cur.fetchone()
        conn.commit()

        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
        cur.execute("SELECT role_name FROM role WHERE role_id = %s",(role_id,))
        role = cur.fetchone()
        return {
            "user_id": user_id,
            "user_name": username,
            "email": email,
            "role": role[0]
        }
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        cur.close()
        conn.close()