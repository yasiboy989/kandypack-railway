from fastapi import FastAPI, HTTPException, Query
from app.api import routers
app = FastAPI(title="Kandypack Backend")
app.include_router(routers.router)
app.include_router(routers.router_truck)
app.include_router(routers.router_routes)
app.include_router(routers.router_deleveries)
app.include_router(routers.router_stores)
app.include_router(routers.router_auditlog)
app.include_router(routers.router_report)
app.include_router(routers.router_socket)