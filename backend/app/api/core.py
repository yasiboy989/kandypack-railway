from fastapi import Depends,HTTPException,status,APIRouter
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from fastapi import Response
from jose import JWTError, jwt 
from datetime import timedelta
from ..db import database
from ..Authenticaton import auth
from datetime import datetime,date


from ..schemas import schemas

auth_router = APIRouter(
    tags=["Authentication & Profile"]
)

user_router = APIRouter(
    tags=["User & Role Management (Admin)"]
)

employee_router = APIRouter(
    tags=["Employee & Scheduling"]
)

customer_router = APIRouter(
    tags = ["Customers"]
)

products_router = APIRouter(
    tags=["Products & Inventory"]
)

orders_router = APIRouter(
    tags=["Orders"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=auth.ALGORITHM)
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT user_id, employee_id, role_id, user_name, email FROM "user" where user_name = %s;', (username,))
        
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

@auth_router.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT user_id,employee_id, role_id,user_name, password_hash FROM "user" where user_name = %s;',(form_data.username,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Username")
        
        user_id = user['user_id']
        employee_id = user['employee_id']
        role_id = user['role_id']
        username = user['user_name']
        password_hash = user['password_hash']

        if not auth.verify_password(form_data.password, password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
        
        access_token_expires = timedelta(minutes=30)
        access_token = auth.create_access_token(
            data={"sub": username, "user_id": user_id, "employee_id": employee_id, "role_id":role_id},
            expires_delta=access_token_expires
        )

        last_login = datetime.now()

        cur.execute('UPDATE "user" SET last_login = %s WHERE user_name = %s;', (last_login,form_data.username))

        conn.commit()

        return {"access_token":access_token, "token_type": "bearer"}
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@auth_router.post("/auth/register_public_customer")
def register_public_customer(payload: dict):
    """Public registration endpoint for customer accounts only.

    Fixes applied:
    - Use case-insensitive uniqueness checks for username and email.
    - Use INSERT ... RETURNING to obtain user_id and customer_id instead of counting rows
      (avoids race conditions and is compatible with SERIAL/SEQUENCE primary keys).
    - Return clear error details for conflicts.
    """
    username = payload.get('username')
    password = payload.get('password')
    email = payload.get('email')
    name = payload.get('name')
    contact = payload.get('contactNumber')
    address = payload.get('address')
    city = payload.get('city')
    cust_type = payload.get('type', 'Retail')

    if not username or not password or not email or not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="username, password, email and name are required")

    try:
        conn = database.get_db_connection()
    except Exception as e:
        # Database connection failed; return 503 with a helpful message
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Database connection error: {e}")

    cur = conn.cursor()

    try:
        # Case-insensitive uniqueness check
        cur.execute('SELECT user_id, user_name, email FROM "user" WHERE LOWER(user_name) = LOWER(%s) OR LOWER(email) = LOWER(%s) LIMIT 1;', (username, email))
        existing = cur.fetchone()
        if existing:
            # Provide a helpful message indicating which field conflicts
            try:
                existing_username = existing.get('user_name') if isinstance(existing, dict) else existing[1]
                existing_email = existing.get('email') if isinstance(existing, dict) else existing[2]
            except Exception:
                existing_username = None
                existing_email = None

            if existing_username and existing_username.lower() == username.lower():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
            if existing_email and existing_email.lower() == email.lower():
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

            # Generic conflict fallback
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already exists")

        # Find a customer-role id
        cur.execute("SELECT role_id FROM role WHERE LOWER(role_name) LIKE 'customer%';")
        role_row = cur.fetchone()
        if not role_row:
            # fallback: try CustomerRep
            cur.execute("SELECT role_id FROM role WHERE LOWER(role_name) = 'customerrep';")
            role_row = cur.fetchone()
        if not role_row:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Customer role not found")

        # role_row may be a dict (RealDictCursor) or tuple
        role_id = role_row['role_id'] if isinstance(role_row, dict) else role_row[0]

        password_hash = auth.get_password_hash(password)

        # Insert user without manually calculating IDs; rely on DB defaults (serial/sequence)
        cur.execute('INSERT INTO "user" (employee_id, role_id, user_name, email, password_hash, last_login) VALUES (%s, %s, %s, %s, %s, %s) RETURNING user_id;', (None, role_id, username, email, password_hash, datetime.now()))
        user_row = cur.fetchone()
        user_id = user_row['user_id'] if isinstance(user_row, dict) else user_row[0]

        # Insert customer record and reference user_id; return generated customer_id
        cur.execute('INSERT INTO customer (name, type, address, city, contact_number, user_id) VALUES (%s, %s, %s, %s, %s, %s) RETURNING customer_id;', (name, cust_type, address, city, contact, user_id))
        customer_row = cur.fetchone()
        customer_id = customer_row['customer_id'] if isinstance(customer_row, dict) else customer_row[0]

        conn.commit()

        return {"user_id": user_id, "customer_id": customer_id}

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        cur.close()
        conn.close()

@auth_router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT, tags = ["Authentication & Profile"])
def logout():
    return

@auth_router.get("/auth/profile", response_model=schemas.UserResponse)
def get_profile(current_user: list = Depends(get_current_user)):

    user_id = current_user[0]
    role_id = current_user[2]
    username = current_user[3]
    email = current_user[4]

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

@auth_router.put("/auth/profile", response_model=schemas.UserResponse)
def update_profile(profile: schemas.UserPorfileUpdate, current_user: list = Depends(get_current_user)):
    user_id = current_user[0]
    role_id = current_user[2]
    username = current_user[3]
    email = current_user[4]
    employee_id = current_user[1]

    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('UPDATE "user" SET email= %s WHERE user_id=%s RETURNING user_id;',(profile.email, user_id,))
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
            "email": profile.email,
            "role": role[0]
        }
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        cur.close()
        conn.close()
 
@user_router.get("/users")
def get_users(current_user: list = Depends(get_current_user)):

    role_id = current_user[2]

    conn = database.get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        current_user_role = cur.fetchone()[0]
        if current_user_role == "Admin":
            cur.execute('SELECT user_id, user_name, email, role_id FROM "user";')
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

@user_router.post("/users", response_model=schemas.UserResponse)
def create_user(new_user: schemas.UserCreate, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        current_user_role = cur.fetchone()[0]
        if current_user_role == "Admin":
            cur.execute('SELECT COUNT(user_id) FROM "user";')
            user_count = cur.fetchone()[0] or 0

            new_user_id = user_count+1

            cur.execute("SELECT role_id FROM role where role_name = %s",(new_user.role,))
            role_row = cur.fetchone()
            if not role_row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
            role_id = role_row[0]

            cur.execute('SELECT COUNT(user_id) FROM "user" WHERE user_name = %s or email = %s',(new_user.username,new_user.email,))
            exist_user_count = cur.fetchone()
            if exist_user_count[0]:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail = "Username or Email already exists")
            
            password_hash = auth.get_password_hash(new_user.password)

            cur.execute('INSERT INTO "user" (user_id, employee_id, role_id, user_name, email, password_hash, last_login) VALUES (%s, %s, %s, %s, %s, %s, %s);',(new_user_id, new_user.employee_id, role_id, new_user.username, new_user.email, password_hash, datetime.now(),))

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

@user_router.get("/users/{user_id}",response_model=schemas.UserResponse)
def get_user(user_id: int,current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        current_user_role = cur.fetchone()[0]
        if current_user_role == "Admin":
            cur.execute('SELECT role_id,user_name, email FROM "user" WHERE user_id = %s;', (user_id,))
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

@user_router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, email: str, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role = cur.fetchone()[0]
        if role == "Admin":
            cur.execute('UPDATE "user" SET email = %s WHERE user_id = %s', (email, user_id,))
            updated_count = cur.rowcount

            if (updated_count==0):
                conn.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
            
            conn.commit()

            cur.execute('SELECT user_name,email,role_id FROM "user" WHERE user_id = %s;',(user_id,))
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

@user_router.delete("/users/{user_id}")
def delete_user(user_id:int, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user[2]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role = cur.fetchone()[0]
        if role == "Admin":
            cur.execute('DELETE FROM "user" WHERE user_id=%s;',(user_id,))
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

@user_router.get("/roles")
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

@user_router.post("/roles", response_model=schemas.Role)
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

@user_router.put("/roles/{new_role_id}", response_model=schemas.Role)
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

@user_router.delete("/roles/{delete_role_id}")
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

@employee_router.get("/employees")
def get_employees(current_user: list = Depends(get_current_user)):
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

@employee_router.post("/employees", response_model=schemas.Employee)
def create_employees(employee: schemas.CreateEmployee,current_user: list = Depends(get_current_user)):
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

@employee_router.get("/employee-shedules")
def get_employee_shedules(current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT schedule_id, employee_id, delivery_id, hours_worked FROM employee_schedule;")
        rows = cur.fetchall()

        shedules = []
        for row in rows:
            shedule: schemas.EmployeeShedules = {
                "sheduleId": row[0],
                "employeeID": row[1],
                "deliveryID": row[2],
                "hoursWorked": row[3]
            }
            shedules.append(shedule)
        
        return shedules

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@employee_router.get("/employee-types")
def get_employee_types(current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT employee_type_id, type_name, hourly_rate, weekly_max_hours, max_consecutive_trips FROM employee_type;")
        rows = cur.fetchall()

        employee_types = []
        for row in rows:
            employee_type = {
                "employee_type_id": row[0],
                "type_name": row[1],
                "hourly_rate": row[2],
                "weekly_max_hours": row[3],
                "max_consecutive_trips": row[4]
            }
            employee_types.append(employee_type)

        return employee_types

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@employee_router.post("/employee-types")
def create_employee_type(employee_type: dict, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT COUNT(employee_type_id) FROM employee_type;")
        employee_type_id = cur.fetchone()[0] + 1

        cur.execute("""
            INSERT INTO employee_type(employee_type_id, type_name, hourly_rate, weekly_max_hours, max_consecutive_trips)
            VALUES (%s, %s, %s, %s, %s);
        """, (employee_type_id, employee_type["type_name"], employee_type["hourly_rate"], 
              employee_type["weekly_max_hours"], employee_type["max_consecutive_trips"]))
        conn.commit()

        return {
            "employee_type_id": employee_type_id,
            "type_name": employee_type["type_name"],
            "hourly_rate": employee_type["hourly_rate"],
            "weekly_max_hours": employee_type["weekly_max_hours"],
            "max_consecutive_trips": employee_type["max_consecutive_trips"]
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@employee_router.post("/employee-shedules", response_model=schemas.EmployeeShedules)
def create_employee_shedule(shedule: schemas.CreateEmployeeSchedule,current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT COUNT(schedule_id) FROM employee_schedule")
        schedule_id = cur.fetchone()[0]+1

        cur.execute("""
            INSERT INTO employee_schedule(schedule_id, employee_id, delivery_id, hours_worked, assigned_at)
            VALUES(%s, %s, %s, %s, %s)
        """, (schedule_id, shedule.employeeId, shedule.deliveryId, shedule.hoursWorked, datetime.now()))

        conn.commit()

        return{
            "sheduleId": schedule_id,
            "employeeId": shedule.employeeId,
            "deliveryId": shedule.deliveryId,
            "hoursWorked": shedule.hoursWorked
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))

    finally:
        cur.close()
        conn.close()

@customer_router.get("/customers")
def get_customers(current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT customer_id, name, city FROM customer;")
        rows = cur.fetchall()

        cutomers = []
        for row in rows:
            cutomer: schemas.Cutomer = {
                "customer_id": row[0],
                "name": row[1],
                "city": row[2]
            }
            cutomers.append(cutomer)
        
        return cutomers

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@customer_router.post("/customers", response_model= schemas.CutomerResponse)
def create_customer(customer: schemas.CreateCustomer, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT count(customer_id) FROM customer;")
        custome_id = cur.fetchone()[0]+1

        cur.execute("""
            INSERT INTO customer (customer_id, name, type, address, city, contact_number)
            VALUES(%s, %s, %s, %s, %s, %s)
        """,(custome_id,customer.name,customer.type, customer.address, customer.city, customer. contactNumber))
        conn.commit()

        return{
            "customer_id": custome_id,
            "name": customer.name,
            "city": customer.city,
            "contactNumber": customer.contactNumber
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))

    finally:
        cur.close()
        conn.close()

@customer_router.get("/customers/{customer_id}/orders")
def get_cutomer_orders(cutomer_id:int,current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT order_id, status FROM "Order" WHERE customer_id = %s',(cutomer_id,))
        rows = cur.fetchall()



        orders = []
        for row in rows:
            order: schemas.Order = {
                "order_id": row[0],
                "status": row[1]
            }
            orders.append(order)
        
        if not orders:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"No orders found for customer with ID {cutomer_id}")   
        
        return orders

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@customer_router.post("/customers/{customer_id}/orders", tags = ["Customers"], response_model=schemas.Order)
def create_customer_order(customer_id: int, order: schemas.CreateOrder, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT customer_id FROM customer WHERE customer_id = %s", (customer_id,))
        existing_customer = cur.fetchone()
        if not existing_customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Customer with ID {customer_id} not found")


        cur.execute('SELECT COUNT(order_id) FROM "Order"')
        order_id = cur.fetchone()[0]+1
        order_date = date.today()
        
        schedule_date = order.scheduleDate
        items = order.items

        cur.execute('INSERT INTO "Order"(order_id, customer_id, order_date, schedule_date, user_id) VALUES(%s, %s, %s, %s, %s)',(order_id, customer_id, order_date, schedule_date, current_user[0]))
        conn.commit()

        for item in items:
            cur.execute("""
                INSERT INTO order_item (order_id, product_id, quantity)
                VALUES(%s, %s, %s);
            """,(order_id, item.productID, item.quantity))

            cur.execute("SELECT available_units FROM product WHERE product_id = %s",(item.productID,))
            available_units = cur.fetchone()[0] - item.quantity

            cur.execute("UPDATE product SET available_units = %s WHERE product_id = %s", (available_units, item.productID,))
        
        conn.commit()

        cur.execute('SELECT order_id, status FROM "Order" WHERE order_id = %s',(order_id,))
        order_fetch = cur.fetchone()

        return{
            "order_id": order_fetch[0],
            "status": order_fetch[1]
        }
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@products_router.get("/products")
def get_products(current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT product_id, product_name, unit_price FROM product;")
        rows = cur.fetchall()

        products=[]

        for row in rows:
            product: schemas.Product = {
                "product_id": row[0],
                "productName": row[1],
                "unitPrice": row[2]
            }

            products.append(product)
        
        return products

    except  Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        conn.close()
        cur.close()

@products_router.post("/products", response_model=schemas.Product)
def create_product(product: schemas.CreateProduct, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT count(product_id) FROM product;")
        product_id  = cur.fetchone()[0]+1
        cur.execute("""
            INSERT INTO product (product_id, product_name, category, unit_price, unit_weight, train_space_per_unit, available_units)
            VALUES(%s, %s, %s, %s, %s, %s, %s);
        """,(product_id, product.productName, product.category, product.unitPrice, product.unitWeight, product.train_space_per_unit, product.available_units,))
        conn.commit()

        return{
            "product_id": product_id,
            "productName": product.productName,
            "unitPrice": product.unitPrice
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@products_router.get("/inventory")
def get_inventory(current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT product_id, available_units FROM product;")
        rows = cur.fetchall()

        inventories = []

        for row in rows:
            inventory: schemas.Inventory = {
                "product_id": row[0],
                "availableUnits":row[1]
            }
            inventories.append(inventory)

        return inventories

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@orders_router.get("/orders")
def get_orders(current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT order_id, status FROM "Order";')
        rows = cur.fetchall()

        orders = []
        for row in rows:
            order: schemas.Order = {
                "order_id": row[0],
                "status": row[1]
            }

            orders.append(order)
        
        return orders

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        conn.close()
        cur.close()

@orders_router.post("/orders", response_model= schemas.Order)
def create_order(order: schemas.CreateOrderWithId, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT COUNT(order_id) FROM "Order"')
        order_id = cur.fetchone()[0]+1
        order_date = date.today()
        
        schedule_date = order.scheduleDate
        items = order.items

        cur.execute('INSERT INTO "Order"(order_id, customer_id, order_date, schedule_date, user_id) VALUES(%s, %s, %s, %s, %s)',(order_id, order.customer_id, order_date, schedule_date, current_user[0]))
        conn.commit()

        for item in items:
            cur.execute("""
                INSERT INTO order_item (order_id, product_id, quantity)
                VALUES(%s, %s, %s);
            """,(order_id, item.productID, item.quantity))

            cur.execute("SELECT available_units FROM product WHERE product_id = %s",(item.productID,))
            available_units = cur.fetchone()[0] - item.quantity

            cur.execute("UPDATE product SET available_units = %s WHERE product_id = %s", (available_units, item.productID,))
            conn.commit()

        cur.execute('SELECT order_id, status FROM "Order" WHERE order_id = %s',(order_id,))
        order_fetch = cur.fetchone()

        return{
            "order_id": order_fetch[0],
            "status": order_fetch[1]
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code= status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))
    
    finally:
        cur.close()
        conn.close()

@orders_router.post("/orders/{order_id}/allocate-train", tags=["Orders"], response_model=schemas.AllocateTrainResponse)
def allocate_train(order_id: int, current_user: list = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT order_id FROM "Order" WHERE order_id = %s;', (order_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order with ID {order_id} not found")
        
        cur.execute("CALL allocate_order_to_train(%s);", (order_id,))
        conn.commit()

        cur.execute("""
            SELECT ts.train_trip_id
            FROM train_schedule ts
            WHERE ts.order_id = %s
            LIMIT 1;
        """, (order_id,))
        result = cur.fetchone()

        if result:
            train_trip_id = result[0]
            return {
                "success": True,
                "message": f"Order allocated to train {train_trip_id}"
            }
        else:
            return {
                "success": False,
                "message": "No available train could accommodate this order"
            }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()
