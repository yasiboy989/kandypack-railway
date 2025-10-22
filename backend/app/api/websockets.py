from fastapi import APIRouter, WebSocket
from typing import List
import asyncio
import datetime
import json
from ..db.database import get_db_connection

router = APIRouter(
    tags=["WebSocket"]
)

# Active connections
connections: List[WebSocket] = []

@router.websocket("/ws/notifications")
async def websocket_notifications(ws: WebSocket):
    await ws.accept()
    connections.append(ws)
    try:
        while True:
            await ws.receive_text() # Keep connection open
    except:
        connections.remove(ws)

@router.websocket("/ws/live-metrics")
async def websocket_live_metrics(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            # Get real-time metrics from database
            conn = get_db_connection()
            cursor = conn.cursor()
            
            try:
                # Get train utilization
                cursor.execute("""
                    SELECT 
                        COALESCE(SUM(allocated_space) / SUM(total_capacity), 0) as utilization
                    FROM train_schedule ts
                    JOIN train_trip tt ON ts.train_trip_id = tt.train_trip_id 
                        AND ts.train_departure_date_time = tt.departure_date_time
                    WHERE ts.status = 'Allocated'
                """)
                train_util = cursor.fetchone()[0] or 0
                
                # Get active deliveries count
                cursor.execute("""
                    SELECT COUNT(*) FROM delivery 
                    WHERE status IN ('Pending', 'In Transit')
                """)
                active_deliveries = cursor.fetchone()[0] or 0
                
                # Get pending orders count
                cursor.execute("""
                    SELECT COUNT(*) FROM "order" 
                    WHERE status = 'Pending'
                """)
                pending_orders = cursor.fetchone()[0] or 0
                
                await ws.send_json({
                    "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                    "metrics": {
                        "train_utilization": float(train_util),
                        "active_deliveries": active_deliveries,
                        "pending_orders": pending_orders
                    }
                })
                
            finally:
                cursor.close()
                conn.close()
                
            await asyncio.sleep(5)
    except:
        pass

@router.websocket("/ws/order-updates")
async def websocket_order_updates(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            # Send order status updates
            conn = get_db_connection()
            cursor = conn.cursor()
            
            try:
                cursor.execute("""
                    SELECT o.order_id, o.status, o.schedule_date, c.name as customer_name
                    FROM "order" o
                    JOIN customer c ON o.customer_id = c.customer_id
                    WHERE o.status IN ('Scheduled', 'In Transit', 'Delivered')
                    ORDER BY o.order_date DESC
                    LIMIT 10
                """)
                recent_orders = cursor.fetchall()
                
                await ws.send_json({
                    "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                    "type": "order_updates",
                    "data": [
                        {
                            "order_id": row[0],
                            "status": row[1],
                            "schedule_date": row[2].isoformat() if row[2] else None,
                            "customer_name": row[3]
                        }
                        for row in recent_orders
                    ]
                })
                
            finally:
                cursor.close()
                conn.close()
                
            await asyncio.sleep(10)
    except:
        pass
