from fastapi import HTTPException, Query,APIRouter,Path,Body, Depends
from ..db.database import get_db_connection
from datetime import datetime
from psycopg2.extras import RealDictCursor
from .core import get_current_user

train_trips_router = APIRouter(
    prefix="/train-trips",   # all routes here start with /train-trips
    tags=["Train Trips"]
)


@train_trips_router.get("/train-trips")
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
        cursor.execute("SELECT train_trip_id, departure_city, arrival_city, departure_date_time, arrival_date_time, total_capacity, available_capacity FROM train_trip;")
        trips = cursor.fetchall()
        return trips
    finally:
        cursor.close()
        conn.close()




@train_trips_router.post("/train-trips/create")
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

@train_trips_router.get("/train-schedules")
def get_train_schedules():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT ts.train_trip_id, ts.train_departure_date_time, ts.order_id, ts.allocated_space, ts.status
            FROM train_schedule ts;
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@train_trips_router.post("/train-schedules")
def create_train_schedule(
    train_trip_id: int = Query(...),
    train_departure_date_time: datetime = Query(...),
    order_id: int = Query(...),
    allocated_space: float = Query(...)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO train_schedule(train_trip_id, train_departure_date_time, order_id, allocated_space, status)
            VALUES (%s, %s, %s, %s, 'Allocated')
            RETURNING train_trip_id, order_id, allocated_space;
        """, (train_trip_id, train_departure_date_time, order_id, allocated_space))
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

@train_trips_router.get("/train-to-store")
def get_train_to_store():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT tts.train_trip_id, tts.train_departure_date_time, tts.store_id, s.city, s.address
            FROM train_to_store tts
            JOIN store s ON tts.store_id = s.store_id;
        """)
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@train_trips_router.post("/train-to-store")
def create_train_to_store(
    train_trip_id: int = Query(...),
    train_departure_date_time: datetime = Query(...),
    store_id: int = Query(...)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO train_to_store(train_trip_id, train_departure_date_time, store_id)
            VALUES (%s, %s, %s)
            RETURNING train_trip_id, store_id;
        """, (train_trip_id, train_departure_date_time, store_id))
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()        
truck_router = APIRouter(
    prefix="/Trucks",   # all routes here start with /train-trips
    tags=["Truck"]
)

@truck_router.get("/trucks")
def get_trucks():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT truck_id, plate_number, max_load, status FROM truck;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@truck_router.post("/trucks")
def create_truck(
    plate_number: str = Query(...), 
    max_load: float = Query(...),
    status: str = Query("Available"),
    store_id: int = Query(None)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO truck(plate_number, max_load, status, store_id) VALUES (%s,%s,%s,%s) RETURNING truck_id, plate_number;",
            (plate_number, max_load, status, store_id)
        )
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

routes_router = APIRouter(
    prefix="/routes",   # all routes here start with /train-trips
    tags=["Routes"]
)

@routes_router.get("/routes")
def get_routes():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT route_id, start_location, end_location, max_delivery_time FROM route;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@routes_router.post("/routes")
def create_route(
    start_location: str = Query(...),
    end_location: str = Query(...),
    max_delivery_time: str = Query(...),
    area_covered_description: str = Query(None)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO route(start_location, end_location, max_delivery_time, area_covered_description) VALUES (%s,%s,%s,%s) RETURNING route_id, start_location, end_location;",
            (start_location, end_location, max_delivery_time, area_covered_description)
        )
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()
deliveries_router = APIRouter(
    prefix="/deliveries",   
    tags=["Deleveries"]
)
@deliveries_router.get("/deliveries")
def get_deliveries():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT delivery_id, truck_id, route_id, delivery_date_time, status FROM delivery;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@deliveries_router.post("/deliveries")
def create_delivery(
    truck_id: int = Query(...),
    route_id: int = Query(...),
    user_id: int = Query(...),
    delivery_date_time: datetime = Query(...),
    driver_employee_id: int = Query(None),
    assistant_employee_id: int = Query(None)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO delivery(truck_id, route_id, user_id, delivery_date_time, driver_employee_id, assistant_employee_id)
               VALUES (%s,%s,%s,%s,%s,%s) RETURNING delivery_id, status;""",
            (truck_id, route_id, user_id, delivery_date_time, driver_employee_id, assistant_employee_id)
        )
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()        
@deliveries_router.put("/{delivery_id}/status")
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

@deliveries_router.get("/assistant/{employee_id}/assignments")
def get_assistant_assignments(employee_id: int = Path(...), current_user = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT
                d.delivery_id,
                d.delivery_date_time,
                d.status,
                r.start_location,
                r.end_location,
                t.plate_number,
                t.truck_id,
                COALESCE(e.first_name || ' ' || e.last_name, 'Not Assigned') AS driver_name,
                e.employee_id AS driver_id,
                COUNT(o.order_id) AS order_count
            FROM delivery d
            JOIN route r ON d.route_id = r.route_id
            JOIN truck t ON d.truck_id = t.truck_id
            LEFT JOIN employee e ON d.driver_employee_id = e.employee_id
            LEFT JOIN "order" o ON o.delivery_id = d.delivery_id
            WHERE d.assistant_employee_id = %s
              AND d.delivery_date_time >= NOW()
            GROUP BY d.delivery_id, d.delivery_date_time, d.status, r.start_location, r.end_location, t.plate_number, t.truck_id, e.employee_id, e.first_name, e.last_name
            ORDER BY d.delivery_date_time ASC
        """, (employee_id,))
        assignments = cursor.fetchall()
        return [dict(a) for a in assignments]
    finally:
        cursor.close()
        conn.close()

@deliveries_router.get("/{delivery_id}/order-items")
def get_delivery_items(delivery_id: int = Path(...), current_user = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT
                o.order_id,
                c.name AS customer_name,
                oi.product_id,
                p.product_name,
                oi.quantity
            FROM "order" o
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN product p ON oi.product_id = p.product_id
            JOIN customer c ON o.customer_id = c.customer_id
            WHERE o.delivery_id = %s
            ORDER BY o.order_id, p.product_name
        """, (delivery_id,))
        items = cursor.fetchall()
        return [dict(i) for i in items]
    finally:
        cursor.close()
        conn.close()

@deliveries_router.post("/{delivery_id}/confirm-item")
def confirm_delivery_item(
    delivery_id: int = Path(...),
    payload: dict = Body(..., example={"order_id": 1, "product_id": 1, "confirmed_quantity": 5}),
    current_user = Depends(get_current_user)
):
    order_id = payload.get("order_id")
    product_id = payload.get("product_id")
    confirmed_quantity = payload.get("confirmed_quantity", 0)

    if not order_id or not product_id:
        raise HTTPException(status_code=400, detail="order_id and product_id are required")

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Create a delivery_confirmation tracking (if you have this table)
        # For now, just mark the item as confirmed by updating status
        cursor.execute("""
            UPDATE "order" SET status = 'Delivered'
            WHERE order_id = %s
            RETURNING order_id, status
        """, (order_id,))
        result = cursor.fetchone()
        conn.commit()

        if not result:
            raise HTTPException(status_code=404, detail="Order not found")

        return {"order_id": result[0] if isinstance(result, tuple) else result['order_id'], "status": result[1] if isinstance(result, tuple) else result['status']}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@deliveries_router.get("/assistant/{employee_id}/notifications")
def get_assistant_notifications(employee_id: int = Path(...), current_user = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        notifications = []

        # Get upcoming deliveries
        cursor.execute("""
            SELECT
                d.delivery_id,
                'Route Update' AS type,
                'Upcoming delivery to ' || r.end_location AS message,
                d.delivery_date_time::text AS timestamp
            FROM delivery d
            JOIN route r ON d.route_id = r.route_id
            WHERE d.assistant_employee_id = %s
              AND d.delivery_date_time >= NOW()
              AND d.delivery_date_time <= NOW() + INTERVAL '24 hours'
            ORDER BY d.delivery_date_time DESC
            LIMIT 5
        """, (employee_id,))

        notifications.extend([dict(n) for n in cursor.fetchall()])

        # Get alerts for items ready for delivery
        cursor.execute("""
            SELECT
                'Alert' AS type,
                'Items ready for delivery at ' || r.end_location AS message,
                NOW()::text AS timestamp
            FROM delivery d
            JOIN route r ON d.route_id = r.route_id
            WHERE d.assistant_employee_id = %s
              AND d.status = 'In Transit'
            LIMIT 3
        """, (employee_id,))

        notifications.extend([dict(n) for n in cursor.fetchall()])

        return notifications
    finally:
        cursor.close()
        conn.close()

stores_router = APIRouter(
    prefix="/stores",   # all routes here start with /train-trips
    tags=["Stores"]
)

@stores_router.get("/stores")
def get_stores():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT store_id, city, address, near_station_name FROM store;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

@stores_router.post("/stores")
def create_store(city: str = Query(...), address: str = Query(...), near_station_name: str = Query(None)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO store(city, address, near_station_name) VALUES (%s,%s,%s) RETURNING store_id, city;",
            (city, address, near_station_name)
        )
        conn.commit()
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

auditlog_router = APIRouter(
    prefix="/auditlogs",   # all routes here start with /train-trips
    tags=["Auditlogs"]
)
@auditlog_router.get("/auditlog")
def get_auditlog():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT audit_id, table_name, operation, performed_by, performed_at FROM audit_log;")
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()

report_router = APIRouter(
    prefix="/report",   # all routes here start with /train-trips
    tags=["Report"]
)        
@report_router.get("/sales")
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


@report_router.get("/truck_usage")
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
@report_router.get("/driver-hours")       
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
