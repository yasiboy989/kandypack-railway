from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import logistics, core, websockets

app = FastAPI(title="Kandypack Backend")

# Enable CORS for local frontend during development. Adjust origins for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:48752", "*"] ,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core business logic routers
app.include_router(core.auth_router)
app.include_router(core.user_router)
app.include_router(core.employee_router)
app.include_router(core.customer_router)
app.include_router(core.products_router)
app.include_router(core.orders_router)
app.include_router(core.dashboard_router)

# Logistics and operations routers
app.include_router(logistics.train_trips_router)
app.include_router(logistics.truck_router)
app.include_router(logistics.routes_router)
app.include_router(logistics.deliveries_router)
app.include_router(logistics.stores_router)
app.include_router(logistics.auditlog_router)
app.include_router(logistics.report_router)

# WebSocket router
app.include_router(websockets.router)
