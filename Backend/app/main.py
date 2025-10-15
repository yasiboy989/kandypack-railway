from fastapi import FastAPI
from .API.routers import auth_router, customer_router, employee_router, orders_router, products_router, user_router 
app = FastAPI(title="KandyPack Backend API")

# Include all routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(employee_router)
app.include_router(customer_router)
app.include_router(products_router)
app.include_router(orders_router)
