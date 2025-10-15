from fastapi import FastAPI, HTTPException, Query,APIRouter,Path,Body,WebSocketDisconnect,WebSocket
from app.db.database import get_db_connection
from datetime import datetime
from psycopg2.extras import RealDictCursor
from typing import List
import asyncio

router = APIRouter(
    prefix="/train-trips",   # all routes here start with /train-trips
    tags=["Train Trips"]
)


@router.get("/train-trips")
# def get_train_trips():
#     conn = get_db_connection()
#     cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
#     try:
#         cursor.execute("""
#             SELECT train_trip_id, departure_city, arrival_city, departure_date_time, arrival_date_time, total_capacity, available_capacity
#             FROM train_trip;
#         """)
#         trips = cursor.fetchall()
        
#         result = []
#         for t in trips:
#             result.append({
#                 "train_trip_id": t["train_trip_id"],
#                 "departure_city": t["departure_city"],
#                 "arrival_city": t["arrival_city"],
#                 "departure_date_time": t["departure_date_time"],  # datetime will be auto-serialized
#                 "arrival_date_time": t["arrival_date_time"],
#                 "total_capacity": t["total_capacity"],
#                 "available_capacity": t["available_capacity"]
#             })
#         return result
#     finally:
#         cursor.close()
#         conn.close()
def get_train_trips():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT train_trip_id, departure_city, arrival_city FROM train_trip;")
        trips = cursor.fetchall()
        return trips
    finally:
        cursor.close()
        conn.close()




@router.post("/train-trips/create")
def create_train_trip(
    departure_city: str = Query(...),
    arrival_city: str = Query(...),
    departure_date_time: datetime = Query(...),
    arrival_date_time: datetime = Query(...),
    total_capacity: float = Query(...)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO train_trip(departure_city, arrival_city, departure_date_time, arrival_date_time, total_capacity, available_capacity)
               VALUES (%s,%s,%s,%s,%s,%s) RETURNING train_trip_id, departure_city;""",
            (departure_city, arrival_city, departure_date_time, arrival_date_time, total_capacity, total_capacity)
        )
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()        

router.get("/train-schedules")
def get_train_schedules():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT ts.train_trip_id, ts.order_id, ts.allocated_space
            FROM train_schedule ts;
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()        
router_truck = APIRouter(
    prefix="/Trucks",   # all routes here start with /train-trips
    tags=["Truck"]
)

@router_truck.get("/trucks")
def get_trucks():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT truck_id, plate_number FROM truck;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router_truck.post("/trucks")
def create_truck(plate_number: str = Query(...), max_load: float = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO truck(plate_number, max_load) VALUES (%s,%s) RETURNING truck_id, plate_number;",
            (plate_number, max_load)
        )
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

router_routes = APIRouter(
    prefix="/routes",   # all routes here start with /train-trips
    tags=["Routes"]
)
@router_routes.get("/routes")
def get_routes():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT route_id, start_location, end_location FROM route;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
router_deleveries = APIRouter(
    prefix="/deliveries",   
    tags=["Deleveries"]
)
@router_deleveries.get("/deliveries")
def get_deliveries():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT delivery_id, status FROM delivery;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router_deleveries.post("/deliveries")
def create_delivery(
    truck_id: int = Query(...),
    route_id: int = Query(...),
    user_id: int = Query(...),
    delivery_date_time: datetime = Query(...)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO delivery(truck_id, route_id, user_id, delivery_date_time)
               VALUES (%s,%s,%s,%s) RETURNING delivery_id, status;""",
            (truck_id, route_id, user_id, delivery_date_time)
        )
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()        
@router_deleveries.put("/{delivery_id}/status")
@router.put("/{delivery_id}/status")
def update_delivery_status(
    delivery_id: int = Path(..., description="ID of the delivery to update"),
    payload: dict = Body(..., example={"status": "In Transit"})
):
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE delivery SET status = %s WHERE delivery_id = %s RETURNING delivery_id, status;",
            (new_status, delivery_id)
        )
        updated = cursor.fetchone()
        conn.commit()
        if not updated:
            raise HTTPException(status_code=404, detail="Delivery not found")
        return {"id": updated["delivery_id"], "status": updated["status"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

router_stores = APIRouter(
    prefix="/stores",   # all routes here start with /train-trips
    tags=["Stores"]
)

@router_stores.get("/stores")
def get_stores():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT store_id, city, address FROM store;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@router_stores.post("/stores")
def create_store(city: str = Query(...), address: str = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO store(city, address) VALUES (%s,%s) RETURNING store_id, city;",
            (city, address)
        )
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

router_auditlog = APIRouter(
    prefix="/auditlogs",   # all routes here start with /train-trips
    tags=["Auditlogs"]
)
@router_auditlog.get("/auditlog")
def get_auditlog():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT audit_id,table_name,operation FROM audit_log;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

router_report = APIRouter(
    prefix="/report",   # all routes here start with /train-trips
    tags=["Report"]
)        
@router_report.get("/sales")
def get_quarterly_sales():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT 
                EXTRACT(YEAR FROM o.order_date) AS year,
                EXTRACT(QUARTER FROM o.order_date) AS quarter,
                COALESCE(SUM(oi.quantity * p.unit_price),0) AS totals
            FROM "Order" o
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN product p ON oi.product_id = p.product_id
            GROUP BY year, quarter
            ORDER BY year, quarter
        """)
        results = cursor.fetchall()
        
        # Format quarter as Q1, Q2, ...
        return [
            {
                "year": int(r["year"]),
                "quarter": f"Q{int(r['quarter'])}",
                "totals": float(r["totals"])
            }
            for r in results
        ]
    finally:
        cursor.close()
        conn.close()


@router_report.get("/truck_usage")
def get_truck_usage():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT t.truck_id,
                   COALESCE(SUM(es.hours_worked) / (COUNT(DISTINCT d.delivery_id) * 24), 0) AS usage_rate
            FROM truck t
            LEFT JOIN delivery d ON t.truck_id = d.truck_id
            LEFT JOIN employee_schedule es ON d.delivery_id = es.delivery_id
            GROUP BY t.truck_id
            ORDER BY t.truck_id
        """)
        result = cursor.fetchall()
        # Access dict keys instead of indices
        return [{"truckId": r["truck_id"], "usageRate": float(r["usage_rate"])} for r in result]
    finally:
        cursor.close()
        conn.close()
@router_report.get("/driver-hours")       
def get_driver_hours():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT e.employee_id, COALESCE(SUM(es.hours_worked),0) AS total_hours
            FROM employee e
            JOIN employee_type et ON e.employee_type_id = et.employee_type_id
            LEFT JOIN employee_schedule es ON e.employee_id = es.employee_id
            WHERE LOWER(et.type_name) = 'driver'
            GROUP BY e.employee_id
            ORDER BY e.employee_id
        """)
        result = cursor.fetchall()
        # Access dict keys
        return [{"employeeId": r["employee_id"], "totalHours": float(r["total_hours"])} for r in result]
    finally:
        cursor.close()
        conn.close()

router_socket = APIRouter(tags=["WebSocket"])

# Active connections
connections: List[WebSocket] = []

@router_socket.websocket("/ws/notifications")
async def websocket_notifications(ws: WebSocket):
    await ws.accept()
    connections.append(ws)
    try:
        while True:
            data = await ws.receive_text()
            # optional: handle client messages
    except:
        connections.remove(ws)


@router_socket.websocket("/ws/live-metrics")
async def websocket_live_metrics(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            # Here you would send metrics periodically
            # Example:
            import asyncio, datetime
            await ws.send_json({
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "metric": "train_utilization",
                "value": 0.74
            })
            await asyncio.sleep(5)
    except:
        pass