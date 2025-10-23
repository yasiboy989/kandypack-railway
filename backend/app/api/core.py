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
    
    conn = None
    cur = None
    try:
        conn = database.get_db_connection()
        cur = conn.cursor()

        cur.execute('SELECT user_id, employee_id, role_id, user_name, email FROM "user" where user_name = %s;', (username,))
        
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        # Return user data as a dictionary for consistent access
        return {
            "user_id": user['user_id'] if isinstance(user, dict) else user[0],
            "employee_id": user['employee_id'] if isinstance(user, dict) else user[1],
            "role_id": user['role_id'] if isinstance(user, dict) else user[2],
            "user_name": user['user_name'] if isinstance(user, dict) else user[3],
            "email": user['email'] if isinstance(user, dict) else user[4]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        if cur:
            cur.close()
        if conn:
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
        
        # Handle both dict and tuple formats
        user_id = user['user_id'] if isinstance(user, dict) else user[0]
        employee_id = user['employee_id'] if isinstance(user, dict) else user[1]
        role_id = user['role_id'] if isinstance(user, dict) else user[2]
        username = user['user_name'] if isinstance(user, dict) else user[3]
        password_hash = user['password_hash'] if isinstance(user, dict) else user[4]

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
def register_public_customer(payload: schemas.PublicCustomerRegister):
    """Public registration endpoint for customer accounts only.

    Fixes applied:
    - Use case-insensitive uniqueness checks for username and email.
    - Use INSERT ... RETURNING to obtain user_id and customer_id instead of counting rows
      (avoids race conditions and is compatible with SERIAL/SEQUENCE primary keys).
    - Return clear error details for conflicts.
    """
    username = payload.username
    password = payload.password
    email = payload.email
    name = payload.name
    contact = payload.contactNumber
    address = payload.address
    city = payload.city
    cust_type = payload.type

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

@auth_router.get("/auth/test")
def test_auth(current_user: dict = Depends(get_current_user)):
    """Test endpoint to verify authentication is working"""
    return {
        "message": "Authentication successful",
        "user_id": current_user["user_id"],
        "username": current_user["user_name"],
        "role_id": current_user["role_id"]
    }

@auth_router.get("/auth/profile", response_model=schemas.UserResponse)
def get_profile(current_user: dict = Depends(get_current_user)):

    user_id = current_user["user_id"]
    role_id = current_user["role_id"]
    username = current_user["user_name"]
    email = current_user["email"]

    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        role_result = cur.fetchone()
        role_name = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]

        # Fetch linked customer_id if exists
        cur.execute("SELECT customer_id FROM customer WHERE user_id = %s;", (user_id,))
        cust_row = cur.fetchone()
        customer_id = None
        if cust_row:
            customer_id = cust_row['customer_id'] if isinstance(cust_row, dict) else cust_row[0]

        return{
            "user_id": user_id,
            "user_name": username,
            "email": email,
            "role": role_name,
            "customer_id": customer_id
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))

    finally:
        cur.close()
        conn.close()

@auth_router.put("/auth/profile", response_model=schemas.UserResponse)
def update_profile(profile: schemas.UserPorfileUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    role_id = current_user["role_id"]
    username = current_user["user_name"]
    email = current_user["email"]
    employee_id = current_user["employee_id"]

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
        role_result = cur.fetchone()
        role_name = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
        return {
            "user_id": user_id,
            "user_name": username,
            "email": profile.email,
            "role": role_name
        }
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        cur.close()
        conn.close()
 
@user_router.get("/users")
def get_users(current_user: dict = Depends(get_current_user)):

    role_id = current_user["role_id"]

    conn = database.get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        role_result = cur.fetchone()
        current_user_role = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
        if current_user_role == "Admin":
            cur.execute('SELECT user_id, user_name, email, role_id FROM "user";')
            rows = cur.fetchall()

            users = []
            for row in rows:
                # Handle both dict and tuple formats
                role_id_for_row = row['role_id'] if isinstance(row, dict) else row[3]
                cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id_for_row,))
                role_result = cur.fetchone()
                role_name = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
                
                user : schemas.UserResponse = {
                    "user_id": row['user_id'] if isinstance(row, dict) else row[0],
                    "user_name": row['user_name'] if isinstance(row, dict) else row[1],
                    "email": row['email'] if isinstance(row, dict) else row[2],
                    "role": role_name
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
def create_user(new_user: schemas.UserCreate, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user["role_id"]
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        role_result = cur.fetchone()
        current_user_role = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
        if current_user_role == "Admin":
            cur.execute('SELECT COUNT(user_id) FROM "user";')
            user_count_result = cur.fetchone()
            user_count = (user_count_result['count'] if isinstance(user_count_result, dict) else user_count_result[0]) or 0

            new_user_id = user_count+1

            cur.execute("SELECT role_id FROM role where role_name = %s",(new_user.role,))
            role_row = cur.fetchone()
            if not role_row:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
            role_id = role_row['role_id'] if isinstance(role_row, dict) else role_row[0]

            cur.execute('SELECT COUNT(user_id) FROM "user" WHERE user_name = %s or email = %s',(new_user.username,new_user.email,))
            exist_user_count_result = cur.fetchone()
            if (exist_user_count_result['count'] if isinstance(exist_user_count_result, dict) else exist_user_count_result[0]):
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
def get_user(user_id: int,current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user["role_id"]
    try:
        cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
        role_result = cur.fetchone()
        current_user_role = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
        if current_user_role == "Admin":
            cur.execute('SELECT role_id,user_name, email FROM "user" WHERE user_id = %s;', (user_id,))
            user_count = cur.rowcount
            if user_count == 0:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
            user = cur.fetchone()

            cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(user['role_id'] if isinstance(user, dict) else user[0],))
            role_result = cur.fetchone()
            role_name = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]

            return{
                "user_id": user_id,
                "user_name": user['user_name'] if isinstance(user, dict) else user[1],
                "email": user['email'] if isinstance(user, dict) else user[2],
                "role": role_name
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
def update_user(user_id: int, email: str, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user["role_id"]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role_result = cur.fetchone()
        role_name = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
        if role_name == "Admin":
            cur.execute('UPDATE "user" SET email = %s WHERE user_id = %s', (email, user_id,))
            updated_count = cur.rowcount

            if (updated_count==0):
                conn.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {user_id} not found")
            
            conn.commit()

            cur.execute('SELECT user_name,email,role_id FROM "user" WHERE user_id = %s;',(user_id,))
            user = cur.fetchone()

            cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(user['role_id'] if isinstance(user, dict) else user[2],))
            role_result = cur.fetchone()
            role_name = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]

            return {
                "user_id": user_id,
                "user_name": user['user_name'] if isinstance(user, dict) else user[0],
                "email": user['email'] if isinstance(user, dict) else user[1],
                "role": role_name
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
def delete_user(user_id:int, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user["role_id"]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role_result = cur.fetchone()
        role = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
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
def get_roles(current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        # Check if current user is admin
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;", (current_user.get("role_id"),))
        role_result = cur.fetchone()

        if not role_result:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")

        role = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]

        if role != "Admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have access to this data")

        # Get all roles
        cur.execute("SELECT role_id, role_name, access_rights FROM role;")
        rows = cur.fetchall()

        roles = []
        for row in rows:
            role_dict = {
                "role_id": row['role_id'] if isinstance(row, dict) else row[0],
                "role_name": row['role_name'] if isinstance(row, dict) else row[1],
                "accessRights": row['access_rights'] if isinstance(row, dict) else row[2]
            }
            roles.append(role_dict)

        return roles
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()    

@user_router.post("/roles", response_model=schemas.Role)
def create_role(new_role: schemas.createRole, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        # Check if current user is admin
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;", (current_user.get("role_id"),))
        role_result = cur.fetchone()

        if not role_result:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")

        role = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]

        if role != "Admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don't have access to create roles")

        # Get next role ID
        cur.execute("SELECT MAX(role_id) FROM role;")
        max_id_result = cur.fetchone()
        max_id = max_id_result['max'] if isinstance(max_id_result, dict) else max_id_result[0]
        new_role_id = (max_id or 0) + 1

        cur.execute(
            "INSERT INTO role (role_id, role_name, access_rights) VALUES(%s, %s, %s);",
            (new_role_id, new_role.role_name, new_role.accessRights)
        )
        conn.commit()

        return {
            "role_id": new_role_id,
            "role_name": new_role.role_name,
            "accessRights": new_role.accessRights
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@user_router.put("/roles/{new_role_id}", response_model=schemas.Role)
def update_role(new_role_id: int,accessRights: str, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user["role_id"]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role_result = cur.fetchone()
        role = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
        if role == "Admin":
            cur.execute("UPDATE role SET access_rights = %s WHERE role_id = %s",(accessRights, new_role_id,))
            role_count = cur.rowcount

            if role_count == 0:
                conn.rollback()
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"Role id with {new_role_id} not found")

            conn.commit()

            cur.execute("SELECT role_name FROM role WHERE role_id = %s;",(role_id,))
            role_name_result = cur.fetchone()
            role_name = role_name_result['role_name'] if isinstance(role_name_result, dict) else role_name_result[0]

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
def delete_role(delete_role_id: int, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    role_id = current_user["role_id"]

    try:
        cur.execute("SELECT role_name FROM role WHERE role_id=%s;",(role_id,))
        role_result = cur.fetchone()
        role = role_result['role_name'] if isinstance(role_result, dict) else role_result[0]
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
def get_employees(current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT employee_id, employee_type_id, first_name, last_name FROM employee;")
        rows = cur.fetchall()

        employees = []
        for row in rows:
            # Handle both dict and tuple formats
            employee_type_id = row['employee_type_id'] if isinstance(row, dict) else row[1]
            cur.execute("SELECT type_name FROM employee_type WHERE employee_type_id = %s",(employee_type_id,))
            employee_type_result = cur.fetchone()
            employee_type = employee_type_result['type_name'] if isinstance(employee_type_result, dict) else employee_type_result[0]

            employee: schemas.Employee = {
                "employee_id": row['employee_id'] if isinstance(row, dict) else row[0],
                "firstName": row['first_name'] if isinstance(row, dict) else row[2],
                "lastName": row['last_name'] if isinstance(row, dict) else row[3],
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
def create_employees(employee: schemas.CreateEmployee,current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT count(employee_id) FROM employee;")
        count_result = cur.fetchone()
        employee_id = (count_result['count'] if isinstance(count_result, dict) else count_result[0]) + 1

        cur.execute("""
                    INSERT INTO employee(employee_id, employee_type_id, first_name, last_name, nic, phone, address, date_hired) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);""",(employee_id, employee.employeeTypeId, employee.firstName, employee.lastName, employee.nic, employee.phone, employee.address, employee.dateHired,))
        conn.commit()
        
        cur.execute("SELECT type_name FROM employee_type WHERE employee_type_id = %s;", (employee.employeeTypeId,))
        type_result = cur.fetchone()
        type_name = type_result['type_name'] if isinstance(type_result, dict) else type_result[0]

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
def get_employee_shedules(current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT schedule_id, employee_id, delivery_id, hours_worked FROM employee_schedule;")
        rows = cur.fetchall()

        shedules = []
        for row in rows:
            shedule: schemas.EmployeeShedules = {
                "sheduleId": row['schedule_id'] if isinstance(row, dict) else row[0],
                "employeeID": row['employee_id'] if isinstance(row, dict) else row[1],
                "deliveryID": row['delivery_id'] if isinstance(row, dict) else row[2],
                "hoursWorked": row['hours_worked'] if isinstance(row, dict) else row[3]
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
def get_employee_types(current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT employee_type_id, type_name, hourly_rate, weekly_max_hours, max_consecutive_trips FROM employee_type;")
        rows = cur.fetchall()

        employee_types = []
        for row in rows:
            employee_type = {
                "employee_type_id": row['employee_type_id'] if isinstance(row, dict) else row[0],
                "type_name": row['type_name'] if isinstance(row, dict) else row[1],
                "hourly_rate": row['hourly_rate'] if isinstance(row, dict) else row[2],
                "weekly_max_hours": row['weekly_max_hours'] if isinstance(row, dict) else row[3],
                "max_consecutive_trips": row['max_consecutive_trips'] if isinstance(row, dict) else row[4]
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
def create_employee_type(employee_type: dict, current_user: dict = Depends(get_current_user)):
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
def create_employee_shedule(shedule: schemas.CreateEmployeeSchedule,current_user: dict = Depends(get_current_user)):
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
def get_customers(current_user: dict = Depends(get_current_user)):
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
def create_customer(customer: schemas.CreateCustomer, current_user: dict = Depends(get_current_user)):
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
def get_cutomer_orders(customer_id:int,current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT order_id, status FROM "order" WHERE customer_id = %s',(customer_id,))
        rows = cur.fetchall()

        orders = []
        for row in rows:
            order: schemas.Order = {
                "order_id": row[0],
                "status": row[1]
            }
            orders.append(order)

        if not orders:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"No orders found for customer with ID {customer_id}")

        return orders

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))

    finally:
        cur.close()
        conn.close()

@customer_router.post("/customers/{customer_id}/orders", tags = ["Customers"], response_model=schemas.Order)
def create_customer_order(customer_id: int, order: schemas.CreateOrder, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT customer_id FROM customer WHERE customer_id = %s", (customer_id,))
        existing_customer = cur.fetchone()
        if not existing_customer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Customer with ID {customer_id} not found")


        cur.execute('SELECT COUNT(order_id) FROM "order"')
        count_result = cur.fetchone()
        order_id = (count_result['count'] if isinstance(count_result, dict) else count_result[0]) + 1
        order_date = date.today()

        schedule_date = order.scheduleDate
        items = order.items

        cur.execute('INSERT INTO "order"(order_id, customer_id, order_date, schedule_date, user_id) VALUES(%s, %s, %s, %s, %s)',(order_id, customer_id, order_date, schedule_date, current_user["user_id"]))
        conn.commit()

        for item in items:
            cur.execute("""
                INSERT INTO order_item (order_id, product_id, quantity)
                VALUES(%s, %s, %s);
            """,(order_id, item.productID, item.quantity))

            cur.execute("SELECT available_units FROM product WHERE product_id = %s",(item.productID,))
            units_result = cur.fetchone()
            available_units = (units_result['available_units'] if isinstance(units_result, dict) else units_result[0]) - item.quantity

            cur.execute("UPDATE product SET available_units = %s WHERE product_id = %s", (available_units, item.productID,))

        conn.commit()

        cur.execute('SELECT order_id, status FROM "order" WHERE order_id = %s',(order_id,))
        order_fetch = cur.fetchone()

        return{
            "order_id": order_fetch['order_id'] if isinstance(order_fetch, dict) else order_fetch[0],
            "status": order_fetch['status'] if isinstance(order_fetch, dict) else order_fetch[1]
        }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@products_router.get("/products")
def get_products(current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT product_id, product_name, unit_price FROM product;")
        rows = cur.fetchall()

        products=[]

        for row in rows:
            product: schemas.Product = {
                "product_id": row['product_id'] if isinstance(row, dict) else row[0],
                "productName": row['product_name'] if isinstance(row, dict) else row[1],
                "unitPrice": row['unit_price'] if isinstance(row, dict) else row[2]
            }

            products.append(product)

        return products

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@products_router.post("/products", response_model=schemas.Product)
def create_product(product: schemas.CreateProduct, current_user: dict = Depends(get_current_user)):
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
def get_inventory(current_user: dict = Depends(get_current_user)):
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
def get_orders(current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT order_id, status FROM "order";')
        rows = cur.fetchall()

        orders = []
        for row in rows:
            order: schemas.Order = {
                "order_id": row['order_id'] if isinstance(row, dict) else row[0],
                "status": row['status'] if isinstance(row, dict) else row[1]
            }
            orders.append(order)

        return orders

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = str(e))

    finally:
        cur.close()
        conn.close()

@orders_router.post("/orders", response_model= schemas.Order)
def create_order(order: schemas.CreateOrderWithId, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT COUNT(order_id) FROM "order"')
        order_id = cur.fetchone()[0]+1
        order_date = date.today()
        
        schedule_date = order.scheduleDate
        items = order.items

        cur.execute('INSERT INTO "order"(order_id, customer_id, order_date, schedule_date, user_id) VALUES(%s, %s, %s, %s, %s)',(order_id, order.customer_id, order_date, schedule_date, current_user["user_id"]))
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

        cur.execute('SELECT order_id, status FROM "order" WHERE order_id = %s',(order_id,))
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

@orders_router.get("/orders/by-user/{user_id}")
def get_orders_by_user(user_id: int, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute('SELECT order_id, status FROM "order" WHERE user_id = %s ORDER BY order_date DESC;', (user_id,))
        rows = cur.fetchall()
        orders = [
            {
                "order_id": row['order_id'] if isinstance(row, dict) else row[0],
                "status": row['status'] if isinstance(row, dict) else row[1]
            }
            for row in rows
        ]
        return orders
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        cur.close()
        conn.close()

@orders_router.post("/orders/{order_id}/allocate-train", tags=["Orders"], response_model=schemas.AllocateTrainResponse)
def allocate_train(order_id: int, current_user: dict = Depends(get_current_user)):
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute('SELECT order_id FROM "order" WHERE order_id = %s;', (order_id,))
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

# Dashboard and Analytics endpoints
dashboard_router = APIRouter(
    tags=["Dashboard & Analytics"]
)

@dashboard_router.get("/dashboard/admin-stats")
def get_admin_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get statistics for admin dashboard"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        # Total orders count
        cur.execute('SELECT COUNT(*) as count FROM "order";')
        result = cur.fetchone()
        total_orders = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # Pending orders count
        cur.execute('SELECT COUNT(*) as count FROM "order" WHERE status = %s;', ('Pending',))
        result = cur.fetchone()
        pending_orders = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # Delivered orders count
        cur.execute('SELECT COUNT(*) as count FROM "order" WHERE status = %s;', ('Delivered',))
        result = cur.fetchone()
        delivered_orders = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # Active users count
        cur.execute('SELECT COUNT(*) as count FROM "user" WHERE last_login IS NOT NULL AND last_login > NOW() - INTERVAL \'30 days\';')
        result = cur.fetchone()
        active_users = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # Train utilization - simplified calculation
        try:
            cur.execute("""
                SELECT
                    COALESCE(AVG(CASE WHEN total_capacity > 0 THEN ((total_capacity - available_capacity)::float / total_capacity) * 100 ELSE 0 END), 0) as utilization
                FROM train_trip
                WHERE departure_date_time > NOW() - INTERVAL '30 days';
            """)
            result = cur.fetchone()
            if result:
                train_utilization = (result['utilization'] if isinstance(result, dict) else result[0]) or 0
            else:
                train_utilization = 0
        except Exception:
            train_utilization = 0

        # Truck utilization
        try:
            cur.execute("""
                SELECT
                    COALESCE(AVG(CASE WHEN status = 'In Service' THEN 100 ELSE 0 END), 0) as utilization
                FROM truck;
            """)
            result = cur.fetchone()
            if result:
                truck_utilization = (result['utilization'] if isinstance(result, dict) else result[0]) or 0
            else:
                truck_utilization = 0
        except Exception:
            truck_utilization = 0

        # Staff active count - just count all employees
        try:
            cur.execute("""
                SELECT COUNT(*) as count FROM employee;
            """)
            result = cur.fetchone()
            staff_active = (result['count'] if isinstance(result, dict) else result[0]) or 0
        except Exception:
            staff_active = 0

        return {
            "total_orders": int(total_orders),
            "pending_orders": int(pending_orders),
            "delivered_orders": int(delivered_orders),
            "active_users": int(active_users),
            "train_utilization": float(round(float(train_utilization), 1)),
            "truck_utilization": float(round(float(truck_utilization), 1)),
            "staff_active": int(staff_active)
        }

    except Exception as e:
        conn.rollback()
        import traceback
        print(f"Dashboard stats error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Dashboard error: {str(e)}")

    finally:
        cur.close()
        conn.close()

@dashboard_router.get("/dashboard/manager-stats")
def get_manager_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get statistics for manager dashboard"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        # Active train trips
        cur.execute("""
            SELECT COUNT(*) as count FROM train_trip
            WHERE departure_date_time > NOW() AND arrival_date_time > NOW();
        """)
        result = cur.fetchone()
        active_train_trips = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # Active truck routes
        cur.execute("""
            SELECT COUNT(*) as count FROM delivery
            WHERE delivery_date_time > NOW() AND status != 'Delivered';
        """)
        result = cur.fetchone()
        active_truck_routes = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # Pending orders
        cur.execute('SELECT COUNT(*) as count FROM "order" WHERE status = %s;', ('Pending',))
        result = cur.fetchone()
        pending_orders = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # On-time delivery rate - based on delivered orders
        cur.execute("""
            SELECT
                COALESCE(
                    COUNT(CASE WHEN status = 'Delivered' THEN 1 END) * 100.0 /
                    NULLIF(COUNT(*), 0),
                    0
                ) as on_time_rate
            FROM "order"
            WHERE status = 'Delivered';
        """)
        result = cur.fetchone()
        on_time_rate = (result['on_time_rate'] if isinstance(result, dict) else result[0]) or 0

        # Upcoming trips with details
        cur.execute("""
            SELECT
                tt.train_trip_id,
                CONCAT(tt.departure_city, ' → ', tt.arrival_city) as route,
                tt.departure_date_time::date as date,
                COALESCE(ROUND((tt.total_capacity - tt.available_capacity) * 100.0 / tt.total_capacity, 1), 0) as capacity_percent,
                COUNT(ts.order_id) as orders_count
            FROM train_trip tt
            LEFT JOIN train_schedule ts ON tt.train_trip_id = ts.train_trip_id
            WHERE tt.departure_date_time > NOW()
            GROUP BY tt.train_trip_id, tt.departure_city, tt.arrival_city, tt.departure_date_time, tt.total_capacity, tt.available_capacity
            ORDER BY tt.departure_date_time
            LIMIT 5;
        """)
        upcoming_trips = cur.fetchall()

        # Pending orders with details
        cur.execute("""
            SELECT
                o.order_id,
                c.name as customer_name,
                COUNT(oi.product_id) as items_count,
                o.schedule_date,
                CASE
                    WHEN o.schedule_date - CURRENT_DATE <= 2 THEN 'High'
                    WHEN o.schedule_date - CURRENT_DATE <= 5 THEN 'Medium'
                    ELSE 'Low'
                END as priority
            FROM "order" o
            JOIN customer c ON o.customer_id = c.customer_id
            LEFT JOIN order_item oi ON o.order_id = oi.order_id
            WHERE o.status = 'Pending'
            GROUP BY o.order_id, c.name, o.schedule_date
            ORDER BY o.schedule_date
            LIMIT 5;
        """)
        pending_orders_details = cur.fetchall()

        return {
            "active_train_trips": active_train_trips,
            "active_truck_routes": active_truck_routes,
            "pending_orders": pending_orders,
            "on_time_rate": round(float(on_time_rate), 1),
            "upcoming_trips": [
                {
                    "id": f"T-{trip['train_trip_id'] if isinstance(trip, dict) else trip[0]}",
                    "route": trip['route'] if isinstance(trip, dict) else trip[1],
                    "date": str(trip['date'] if isinstance(trip, dict) else trip[2]),
                    "capacity": f"{trip['capacity_percent'] if isinstance(trip, dict) else trip[3]}%",
                    "orders": trip['orders_count'] if isinstance(trip, dict) else trip[4]
                } for trip in upcoming_trips
            ],
            "pending_orders_details": [
                {
                    "id": f"#{order['order_id'] if isinstance(order, dict) else order[0]}",
                    "customer": order['customer_name'] if isinstance(order, dict) else order[1],
                    "items": order['items_count'] if isinstance(order, dict) else order[2],
                    "deadline": str(order['schedule_date'] if isinstance(order, dict) else order[3]),
                    "priority": order['priority'] if isinstance(order, dict) else order[4]
                } for order in pending_orders_details
            ]
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@dashboard_router.get("/dashboard/customer-stats")
def get_customer_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get statistics for customer dashboard"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        # Get customer ID from user
        cur.execute("""
            SELECT c.customer_id FROM customer c
            JOIN "user" u ON c.user_id = u.user_id
            WHERE u.user_id = %s;
        """, (current_user["user_id"],))
        customer_result = cur.fetchone()

        if not customer_result:
            # Return empty dashboard instead of 404 for non-customers
            return {
                "total_orders": 0,
                "active_orders": 0,
                "recent_orders": []
            }

        customer_id = customer_result['customer_id'] if isinstance(customer_result, dict) else customer_result[0]

        # Get customer orders
        cur.execute("""
            SELECT order_id, status, order_date, schedule_date
            FROM "order"
            WHERE customer_id = %s
            ORDER BY order_date DESC;
        """, (customer_id,))
        orders = cur.fetchall()

        active_orders = len([o for o in orders if (o['status'] if isinstance(o, dict) else o[1]) != 'Delivered'])

        return {
            "total_orders": len(orders),
            "active_orders": active_orders,
            "recent_orders": [
                {
                    "order_id": order['order_id'] if isinstance(order, dict) else order[0],
                    "status": order['status'] if isinstance(order, dict) else order[1],
                    "order_date": str(order['order_date'] if isinstance(order, dict) else order[2]),
                    "delivery_date": str(order['schedule_date'] if isinstance(order, dict) else order[3])
                } for order in orders[:5]
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@dashboard_router.get("/dashboard/admin-chart-data")
def get_admin_chart_data(current_user: dict = Depends(get_current_user)):
    """Get data for admin dashboard charts (revenue and visitor data)"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        # Get revenue by customer type for the bar chart
        cur.execute("""
            SELECT
                TO_CHAR(o.order_date, 'YYYY-MM') as month,
                c.type as customer_type,
                COALESCE(SUM(oi.quantity * p.unit_price), 0) as revenue
            FROM "order" o
            JOIN customer c ON o.customer_id = c.customer_id
            LEFT JOIN order_item oi ON o.order_id = oi.order_id
            LEFT JOIN product p ON oi.product_id = p.product_id
            WHERE o.order_date >= NOW() - INTERVAL '12 months'
            GROUP BY month, customer_type
            ORDER BY month DESC
            LIMIT 12
        """)
        revenue_data = cur.fetchall()

        # Process revenue data into monthly breakdown
        monthly_revenue = {}
        for row in revenue_data:
            month = row[0] if isinstance(row, tuple) else row['month']
            customer_type = row[1] if isinstance(row, tuple) else row['customer_type']
            revenue = float(row[2] if isinstance(row, tuple) else row['revenue'])

            if month not in monthly_revenue:
                monthly_revenue[month] = {'current_clients': 0, 'subscribers': 0, 'new_customers': 0}

            # Map customer types to categories
            if customer_type and customer_type.lower() == 'wholesale':
                monthly_revenue[month]['current_clients'] += revenue
            elif customer_type and customer_type.lower() == 'retail':
                monthly_revenue[month]['subscribers'] += revenue
            else:
                monthly_revenue[month]['new_customers'] += revenue

        # Get total revenue
        cur.execute("""
            SELECT COALESCE(SUM(oi.quantity * p.unit_price), 0) as total
            FROM "order" o
            LEFT JOIN order_item oi ON o.order_id = oi.order_id
            LEFT JOIN product p ON oi.product_id = p.product_id
            WHERE o.order_date >= NOW() - INTERVAL '30 days'
        """)
        total_revenue_result = cur.fetchone()
        total_revenue = float(total_revenue_result[0] if isinstance(total_revenue_result, tuple) else total_revenue_result['total']) if total_revenue_result else 0

        # Get revenue by customer type for analysis
        cur.execute("""
            SELECT
                c.type as customer_type,
                COALESCE(SUM(oi.quantity * p.unit_price), 0) as revenue,
                COUNT(DISTINCT o.order_id) as order_count
            FROM "order" o
            JOIN customer c ON o.customer_id = c.customer_id
            LEFT JOIN order_item oi ON o.order_id = oi.order_id
            LEFT JOIN product p ON oi.product_id = p.product_id
            WHERE o.order_date >= NOW() - INTERVAL '30 days'
            GROUP BY c.type
        """)
        revenue_results = cur.fetchall()

        revenue_by_type = {}
        total_revenue_30days = 0
        for row in revenue_results:
            customer_type = row[0] if isinstance(row, tuple) else row['customer_type']
            revenue = float(row[1] if isinstance(row, tuple) else row['revenue'])
            order_count = int(row[2] if isinstance(row, tuple) else row['order_count'])

            if customer_type:
                revenue_by_type[customer_type] = {
                    'revenue': revenue,
                    'orders': order_count
                }
                total_revenue_30days += revenue

        return {
            "revenue": {
                "total": round(total_revenue, 2),
                "monthly_data": {month: values for month, values in sorted(monthly_revenue.items(), reverse=True)[:12]},
                "growth_percent": 14.8  # Can be calculated if needed
            },
            "revenue_analysis": {
                "total": round(total_revenue_30days, 2),
                "by_type": revenue_by_type,
                "wholesale": {
                    "revenue": round(revenue_by_type.get('Wholesale', {}).get('revenue', 0), 2),
                    "orders": revenue_by_type.get('Wholesale', {}).get('orders', 0),
                    "percent": round((revenue_by_type.get('Wholesale', {}).get('revenue', 0) / total_revenue_30days * 100), 1) if total_revenue_30days > 0 else 0
                },
                "retail": {
                    "revenue": round(revenue_by_type.get('Retail', {}).get('revenue', 0), 2),
                    "orders": revenue_by_type.get('Retail', {}).get('orders', 0),
                    "percent": round((revenue_by_type.get('Retail', {}).get('revenue', 0) / total_revenue_30days * 100), 1) if total_revenue_30days > 0 else 0
                }
            }
        }

    except Exception as e:
        conn.rollback()
        import traceback
        print(f"Chart data error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@dashboard_router.get("/dashboard/admin-alerts")
def get_admin_alerts(current_user: dict = Depends(get_current_user)):
    """Get recent alerts for admin dashboard from delivery performance and system events"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        alerts = []

        # Get cancelled deliveries as alerts
        cur.execute("""
            SELECT
                'error' as alert_type,
                'Cancelled delivery in Route #' || r.route_id as message,
                d.delivery_date_time as timestamp
            FROM delivery d
            JOIN route r ON d.route_id = r.route_id
            WHERE d.status = 'Cancelled'
            ORDER BY d.delivery_date_time DESC
            LIMIT 3
        """)
        failed_deliveries = cur.fetchall()

        # Get capacity warnings
        cur.execute("""
            SELECT
                'warning' as alert_type,
                'Train capacity near limit for Trip #' || tt.train_trip_id as message,
                tt.departure_date_time as timestamp
            FROM train_trip tt
            WHERE (tt.available_capacity / tt.total_capacity) < 0.2
              AND tt.departure_date_time > NOW()
            ORDER BY tt.departure_date_time DESC
            LIMIT 3
        """)
        capacity_warnings = cur.fetchall()

        # Get pending order warnings (orders past deadline)
        cur.execute("""
            SELECT
                'warning' as alert_type,
                'Order #' || o.order_id || ' deadline approaching - ' || c.name as message,
                o.schedule_date as timestamp
            FROM "order" o
            JOIN customer c ON o.customer_id = c.customer_id
            WHERE o.status = 'Pending'
              AND o.schedule_date <= NOW() + INTERVAL '2 days'
              AND o.schedule_date > NOW()
            ORDER BY o.schedule_date ASC
            LIMIT 2
        """)
        deadline_alerts = cur.fetchall()

        # Combine all alerts
        all_alerts = failed_deliveries + capacity_warnings + deadline_alerts

        # Convert to readable format
        for alert in all_alerts:
            alert_type = alert[0] if isinstance(alert, tuple) else alert['alert_type']
            message = alert[1] if isinstance(alert, tuple) else alert['message']
            timestamp = alert[2] if isinstance(alert, tuple) else alert['timestamp']

            # Calculate time ago
            if timestamp:
                time_diff = datetime.now() - timestamp
                if time_diff.total_seconds() < 60:
                    time_ago = "just now"
                elif time_diff.total_seconds() < 3600:
                    mins = int(time_diff.total_seconds() / 60)
                    time_ago = f"{mins} min{'s' if mins > 1 else ''} ago"
                elif time_diff.total_seconds() < 86400:
                    hours = int(time_diff.total_seconds() / 3600)
                    time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
                else:
                    days = int(time_diff.total_seconds() / 86400)
                    time_ago = f"{days} day{'s' if days > 1 else ''} ago"
            else:
                time_ago = "unknown"

            alerts.append({
                "type": alert_type,
                "message": message,
                "time": time_ago
            })

        # Return up to 5 most recent alerts
        return alerts[:5] if alerts else [
            {"type": "info", "message": "No active alerts", "time": "now"}
        ]

    except Exception as e:
        conn.rollback()
        import traceback
        print(f"Alerts error: {str(e)}")
        print(traceback.format_exc())
        # Return empty alerts on error instead of failing
        return [
            {"type": "info", "message": "No active alerts", "time": "now"}
        ]

    finally:
        cur.close()
        conn.close()

# Order management endpoints
@orders_router.get("/orders/{order_id}")
def get_order_details(order_id: int, current_user: dict = Depends(get_current_user)):
    """Get detailed order information"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT 
                o.order_id, o.status, o.order_date, o.schedule_date,
                c.name as customer_name, c.city as customer_city,
                d.delivery_date_time, d.status as delivery_status
            FROM "order" o
            JOIN customer c ON o.customer_id = c.customer_id
            LEFT JOIN delivery d ON o.delivery_id = d.delivery_id
            WHERE o.order_id = %s;
        """, (order_id,))
        
        order = cur.fetchone()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        # Get order items
        cur.execute("""
            SELECT 
                oi.product_id, oi.quantity,
                p.product_name, p.unit_price
            FROM order_item oi
            JOIN product p ON oi.product_id = p.product_id
            WHERE oi.order_id = %s;
        """, (order_id,))
        
        items = cur.fetchall()

        return {
            "order_id": order[0],
            "status": order[1],
            "order_date": str(order[2]),
            "schedule_date": str(order[3]),
            "customer_name": order[4],
            "customer_city": order[5],
            "delivery_date_time": str(order[6]) if order[6] else None,
            "delivery_status": order[7],
            "items": [
                {
                    "product_id": item[0],
                    "quantity": item[1],
                    "product_name": item[2],
                    "unit_price": float(item[3])
                } for item in items
            ]
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    finally:
        cur.close()
        conn.close()

@orders_router.put("/orders/{order_id}/status")
def update_order_status(order_id: int, status_update: dict, current_user: dict = Depends(get_current_user)):
    """Update order status"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        new_status = status_update.get("status")
        if not new_status:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status is required")

        cur.execute('UPDATE "order" SET status = %s WHERE order_id = %s RETURNING order_id, status;', (new_status, order_id))
        updated = cur.fetchone()

        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        conn.commit()

        return {
            "order_id": updated[0],
            "status": updated[1]
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@dashboard_router.get("/dashboard/warehouse-manager-stats")
def get_warehouse_manager_stats(current_user: dict = Depends(get_current_user)):
    """Get statistics for warehouse manager dashboard"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        # Total products in stock
        cur.execute('SELECT COUNT(*) as count FROM product;')
        result = cur.fetchone()
        total_products = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # Total units available
        cur.execute('SELECT COALESCE(SUM(available_units), 0) as total FROM product;')
        result = cur.fetchone()
        total_units = int((result['total'] if isinstance(result, dict) else result[0]) or 0)

        # Low stock items (below threshold - using 50 as default threshold)
        cur.execute("""
            SELECT COUNT(*) as count FROM product
            WHERE available_units < 50;
        """)
        result = cur.fetchone()
        low_stock_items = (result['count'] if isinstance(result, dict) else result[0]) or 0

        # Recent stock updates (last 5 changes) - simplified version
        cur.execute("""
            SELECT
                product_id,
                product_name,
                available_units,
                category,
                TO_CHAR(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS') as last_updated
            FROM product
            ORDER BY product_id DESC
            LIMIT 5;
        """)
        recent_updates = cur.fetchall()

        # Stock distribution by category
        cur.execute("""
            SELECT
                category,
                COUNT(*) as product_count,
                COALESCE(SUM(available_units), 0) as total_units
            FROM product
            GROUP BY category
            ORDER BY total_units DESC;
        """)
        category_distribution = cur.fetchall()

        # Stock trend - received vs issued (using order data)
        cur.execute("""
            SELECT
                TO_CHAR(o.order_date, 'YYYY-MM-DD') as date,
                COALESCE(SUM(oi.quantity), 0) as issued_units
            FROM "order" o
            LEFT JOIN order_item oi ON o.order_id = oi.order_id
            WHERE o.order_date >= NOW() - INTERVAL '30 days'
            GROUP BY TO_CHAR(o.order_date, 'YYYY-MM-DD')
            ORDER BY date DESC;
        """)
        stock_trend = cur.fetchall()

        return {
            "total_products": int(total_products),
            "total_units": total_units,
            "low_stock_items": int(low_stock_items),
            "recent_updates": [
                {
                    "product_id": update[0] if isinstance(update, tuple) else update['product_id'],
                    "product_name": update[1] if isinstance(update, tuple) else update['product_name'],
                    "available_units": int(update[2] if isinstance(update, tuple) else update['available_units']),
                    "category": update[3] if isinstance(update, tuple) else update['category'],
                    "last_updated": str(update[4] if isinstance(update, tuple) else update['last_updated'])
                } for update in recent_updates
            ],
            "category_distribution": [
                {
                    "category": dist[0] if isinstance(dist, tuple) else dist['category'],
                    "product_count": int(dist[1] if isinstance(dist, tuple) else dist['product_count']),
                    "total_units": int(dist[2] if isinstance(dist, tuple) else dist['total_units'])
                } for dist in category_distribution
            ],
            "stock_trend": [
                {
                    "date": trend[0] if isinstance(trend, tuple) else trend['date'],
                    "issued_units": int(trend[1] if isinstance(trend, tuple) else trend['issued_units'])
                } for trend in stock_trend
            ]
        }

    except Exception as e:
        conn.rollback()
        import traceback
        print(f"Warehouse stats error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@products_router.get("/products/{product_id}")
def get_product(product_id: int, current_user: dict = Depends(get_current_user)):
    """Get detailed product information"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT
                product_id, product_name, category, unit_price, unit_weight,
                train_space_per_unit, available_units
            FROM product
            WHERE product_id = %s;
        """, (product_id,))

        product = cur.fetchone()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        return {
            "product_id": product[0] if isinstance(product, tuple) else product['product_id'],
            "product_name": product[1] if isinstance(product, tuple) else product['product_name'],
            "category": product[2] if isinstance(product, tuple) else product['category'],
            "unit_price": float(product[3] if isinstance(product, tuple) else product['unit_price']),
            "unit_weight": float(product[4] if isinstance(product, tuple) else product['unit_weight']),
            "train_space_per_unit": float(product[5] if isinstance(product, tuple) else product['train_space_per_unit']),
            "available_units": int(product[6] if isinstance(product, tuple) else product['available_units'])
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()

@products_router.put("/products/{product_id}")
def update_product(product_id: int, update_data: dict, current_user: dict = Depends(get_current_user)):
    """Update product information (e.g., stock units)"""
    conn = database.get_db_connection()
    cur = conn.cursor()

    try:
        # Extract fields to update
        available_units = update_data.get("available_units")
        unit_price = update_data.get("unit_price")

        if available_units is not None:
            cur.execute(
                'UPDATE product SET available_units = %s WHERE product_id = %s;',
                (available_units, product_id)
            )

        if unit_price is not None:
            cur.execute(
                'UPDATE product SET unit_price = %s WHERE product_id = %s;',
                (unit_price, product_id)
            )

        conn.commit()

        # Fetch and return updated product
        cur.execute("""
            SELECT
                product_id, product_name, category, unit_price, unit_weight,
                train_space_per_unit, available_units
            FROM product
            WHERE product_id = %s;
        """, (product_id,))

        product = cur.fetchone()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        return {
            "product_id": product[0] if isinstance(product, tuple) else product['product_id'],
            "product_name": product[1] if isinstance(product, tuple) else product['product_name'],
            "category": product[2] if isinstance(product, tuple) else product['category'],
            "unit_price": float(product[3] if isinstance(product, tuple) else product['unit_price']),
            "unit_weight": float(product[4] if isinstance(product, tuple) else product['unit_weight']),
            "train_space_per_unit": float(product[5] if isinstance(product, tuple) else product['train_space_per_unit']),
            "available_units": int(product[6] if isinstance(product, tuple) else product['available_units'])
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    finally:
        cur.close()
        conn.close()
