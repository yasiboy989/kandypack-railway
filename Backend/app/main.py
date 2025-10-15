from fastapi import FastAPI,Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from fastapi import Response
from jose import JWTError, jwt 
from datetime import timedelta
from Database import database
from Authenticaton import auth
from datetime import datetime

from Schemas import schemas

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=auth.ALGORITHM)
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT * FROM user_account where user_name = %s;", (username,))
        
        user = cur.fetchone()

        if not user :
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.post("/auth/login", tags=["Authentication & Profile"])
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT user_id,employee_id, role_id,user_name, password_hash FROM user_account where user_name = %s;",(form_data.username,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Username")
        
        user_id, employee_id, role_id, username, password_hash = user

        if not auth.verify_password(form_data.password,password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
        
        access_token_expires = timedelta(minutes=30)
        access_token = auth.create_access_token(
            data={"sub": username, "user_id": user_id, "employee_id": employee_id, "role_id":role_id},
            expires_delta=access_token_expires
        )

        last_login = datetime.now()

        cur.execute("UPDATE user_account SET last_login = %s WHERE user_name = %s;", (last_login,form_data.username))

        conn.commit()

        return {"access_token":access_token, "token_type": "bearer"}
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@app.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT, tags = ["Authentication & Profile"])
def logout():
    return

@app.get("/auth/profile", response_model=schemas.UserResponse, tags=["Authentication & Profile"])
def get_profile(current_user: list = Depends(get_current_user)):

    user_id = current_user[0]
    role_id = current_user[2]
    username = current_user[3]
    email = current_user[5]

    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        role = cur.fetchone()

        return{
            "user_id": user_id,
            "user_name": username,
            "email": email,
            "role": role[0]
        }
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.put("/auth/profile", response_model=schemas.UserResponse, tags=["Authentication & Profile"])
def update_profile(profile: schemas.UserPorfileUpdate, current_user: list = Depends(get_current_user)):
    user_id = current_user[0]
    role_id = current_user[2]
    username = current_user[3]
    email = current_user[5]
    employee_id = current_user[1]

    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("UPDATE user_account SET email= %s WHERE user_id=%s RETURNING user_id;",(email, user_id,))
        updated = cur.fetchone()
        conn.commit()

        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        cur.execute("UPDATE employee SET phone= %s WHERE employee_id=%s RETURNING employee_id;",(profile.phone, employee_id,))
        updated = cur.fetchone()
        conn.commit()

        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
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
 
@app.get("/users",tags = ["User & Role Management (Admin)"])
def get_users(current_user: list = Depends(get_current_user)):

    role_id = current_user[2]

    conn = database.get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        current_user_role = cur.fetchone()[0]
        if current_user_role == "Admin":
            cur.execute("SELECT user_id, user_name, email, role_id FROM user_account;")
            rows = cur.fetchall()

            users = []
            for row in rows:
                cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(row[3],))
                role = cur.fetchone()
                user : schemas.UserResponse = {
                    "user_id": row[0],
                    "user_name":row[1],
                    "email": row[2],
                    "role": role[0]
                }
                users.append(user)

            return users
        else:
            conn.rollback()
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
    
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.post("/users", tags = ["User & Role Management (Admin)"], response_model=schemas.UserResponse)
def create_user(new_user: schemas.UserCreate, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        current_user_role = cur.fetchone()[0]
        if current_user_role == "Admin":
            cur.execute("SELECT COUNT(user_id) FROM user_account;")
            user_count = cur.fetchone()[0] or 0

            new_user_id = user_count+1

            cur.execute("SELECT role_id FROM role where role_name = %s",(new_user.role,))
            role_row = cur.fetchone()
            if not role_row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
            role_id = role_row[0]

            cur.execute("SELECT COUNT(user_id) FROM user_account WHERE user_name = %s or email = %s",(new_user.username,new_user.email,))
            exist_user_count = cur.fetchone()
            if exist_user_count[0]:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail = "Username or Email already exists")
            
            password_hash = auth.get_password_hash(new_user.password)

            cur.execute("INSERT INTO user_account (user_id, employee_id, role_id, user_name, email, password_hash, last_login) VALUES (%s, %s, %s, %s, %s, %s, %s);",(new_user_id, new_user.employee_id, role_id, new_user.username, new_user.email, password_hash, datetime.now(),))

            conn.commit()

            return{
                "user_id": new_user_id,
                "user_name": new_user.username,
                "email": new_user.email,
                "role" : new_user.role
            }

        else:
            conn.rollback()
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@app.get("/users/{user_id}", tags = ["User & Role Management (Admin)"],response_model=schemas.UserResponse)
def get_user(user_id: int,current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        current_user_role = cur.fetchone()[0]
        if current_user_role == "Admin":
            cur.execute("SELECT role_id,user_name, email FROM user_account WHERE user_id = %s;", (user_id,))
            user_count = cur.rowcount
            if user_count == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
            user = cur.fetchone()

            cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(user[0],))
            role = cur.fetchone()[0]

            return{
                "user_id": user_id,
                "user_name": user[1],
                "email": user[2],
                "role": role
            }

        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@app.put("/users/{user_id}", tags=["User & Role Management (Admin)"], response_model=schemas.UserResponse)
def update_user(user_id: int, email: str, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role = cur.fetchone()[0]
        if role == "Admin":
            cur.execute("UPDATE user_account SET email = %s WHERE user_id = %s", (email, user_id,))
            updated_count = cur.rowcount

            if (updated_count==0):
                conn.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
            
            conn.commit()

            cur.execute("SELECT user_name,email,role_id FROM user_account WHERE user_id = %s;",(user_id,))
            user = cur.fetchone()

            cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(user[2],))
            role = cur.fetchone()[0]

            return {
                "user_id": user_id,
                "user_name":user[0],
                "email": user[1],
                "role": role
            }
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@app.delete("/users/{user_id}", tags=["User & Role Management (Admin)"])
def delete_user(user_id:int, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role = cur.fetchone()[0]
        if role == "Admin":
            cur.execute("DELETE FROM user_account WHERE user_id=%s;",(user_id,))
            deleted_count = cur.rowcount  # Number of deleted rows
            if deleted_count == 0:
                conn.rollback()
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User with ID {user_id} not found"
                )
            
            conn.commit()

            return Response(status_code=status.HTTP_204_NO_CONTENT)
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        conn.rollback()
        cur.close()
        conn.close()

@app.get("/roles", tags = ["User & Role Management (Admin)"])
def get_roles(current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role = cur.fetchone()[0]
        if role == "Admin":
            cur.execute("SELECT * FROM role;")
            rows = cur.fetchall()
            
            roles = []

            for row in rows:
                role : schemas.Role = {
                    "role_id": row[0],
                    "role_name": row[1],
                    "accessRights": row[2]
                }
                roles.append(role)
            
            return roles
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()    

@app.post("/roles", tags = ["User & Role Management (Admin)"], response_model=schemas.Role)
def create_role(new_role: schemas.createRole, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role = cur.fetchone()[0]
        if role == "Admin":
            cur.execute("SELECT count(role_id) FROM role;")
            new_role_id = cur.fetchone()[0]+1

            cur.execute("INSERT INTO role (role_id, role_name, access_rights) VALUES(%s, %s, %s);",(new_role_id, new_role.role_name, new_role.accessRights))
            conn.commit()

            return {
                "role_id": new_role_id,
                "role_name": new_role.role_name,
                "accessRights": new_role.accessRights
            }
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.put("/roles/{new_role_id}", tags = ["User & Role Management (Admin)"], response_model=schemas.Role)
def update_role(new_role_id: int,accessRights: str, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role = cur.fetchone()[0]
        if role == "Admin":
            cur.execute("UPDATE role SET access_rights = %s WHERE role_id = %s",(accessRights, new_role_id,))
            role_count = cur.rowcount

            if role_count == 0:
                conn.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"Role id with {new_role_id} not found")

            conn.commit()

            cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
            role_name = cur.fetchone()[0]

            return {
                "role_id":new_role_id,
                "role_name": role_name,
                "accessRights": accessRights
            }
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.delete("/roles/{delete_role_id}", tags=["User & Role Management (Admin)"])
def delete_role(delete_role_id: int, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role = cur.fetchone()[0]
        if role == "Admin":
            cur.execute("DELETE FROM role WHERE role_id = %s",(delete_role_id,))
            delete_count = cur.rowcount

            if delete_count == 0:
                conn.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"Role with role_id {delete_role_id} not found")
            
            conn.commit()

            return Response(status_code=status.HTTP_204_NO_CONTENT)
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "You haven't access for the data")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.get("/employees", tags = ["Employee & Scheduling"])
def get_employees():
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT employee_id, employee_type_id, first_name, last_name FROM employee;")
        rows = cur.fetchall()

        employees = []
        for row in rows:
            cur.execute("SELECT type_name FROM employee_type WHERE employee_type_id = %s",(row[1],))
            employee_type = cur.fetchone()[0]

            employee: schemas.Employee = {
                "employee_id": row[0],
                "firstName": row[2],
                "lastName": row[3],
                "type": employee_type
            }

            employees.append(employee)

        return employees
            

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@app.post("/employees", tags=["Employee & Scheduling"], response_model=schemas.Employee)
def create_employees(employee: schemas.CreateEmployee):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT count(employee_id) FROM employee;")
        employee_id = cur.fetchone()[0]+1

        cur.execute("""
                    INSERT INTO employee(employee_id, employee_type_id, first_name, last_name, nic, phone, address, date_hired) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);""",(employee_id, employee.employeeTypeId, employee.firstName, employee.lastName, employee.nic, employee.phone, employee.address, employee.dateHired,))
        conn.commit()
        
        cur.execute("SELECT type_name FROM employee_type WHERE employee_type_id = %s;", (employee.employeeTypeId,))
        type_name = cur.fetchone()[0]

        if not type_name:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"Employee type id {employee.employeeTypeId} with not found.")

        return{
            "employee_id": employee_id,
            "firstName": employee.firstName,
            "lastName": employee.lastName,
            "type": type_name
        }
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()