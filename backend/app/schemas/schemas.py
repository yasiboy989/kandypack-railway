from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import List, Optional
from enum import Enum

class DeliveryStatus(str, Enum):
    PENDING = "Pending"
    IN_TRANSIT = "In Transit"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

class OrderStatus(str, Enum):
    PENDING = "Pending"
    SCHEDULED = "Scheduled"
    IN_TRANSIT = "In Transit"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

class TruckStatus(str, Enum):
    AVAILABLE = "Available"
    IN_SERVICE = "In Service"
    UNDER_REPAIR = "Under Repair"

class TrainScheduleStatus(str, Enum):
    ALLOCATED = "Allocated"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class EmploymentStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    TERMINATED = "Terminated"

class CustomerType(str, Enum):
    WHOLESALE = "Wholesale"
    RETAIL = "Retail"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    role: str
    password: str
    employee_id: Optional[int] = None

class UserResponse(BaseModel):
    user_id: int
    user_name: str
    email: EmailStr
    role: str
    customer_id: Optional[int] = None

class UserPorfileUpdate(BaseModel):
    email: EmailStr
    phone: str

class Role(BaseModel):
    role_id: int
    role_name: str
    accessRights: str

class createRole(BaseModel):
    role_name: str
    accessRights: str

class CreateEmployee(BaseModel):
    firstName: str
    lastName: str
    employeeTypeId: int
    nic: str
    phone: str
    address: str
    dateHired: date

class EmployeeShedules(BaseModel):
    sheduleId: int
    employeeId: int
    deliveryId: int
    hoursWorked: float

class CreateEmployeeSchedule(BaseModel):
    employeeId: int
    deliveryId: int
    hoursWorked: float

class Customer(BaseModel):
    customer_id: int
    name: str
    city: str

class CreateCustomer(BaseModel):
    name: str
    type: CustomerType
    address: str
    city: str
    contactNumber: str

class CutomerResponse(BaseModel):
    customer_id: int
    name: str
    city: str
    contactNumber: str

class Order(BaseModel):
    order_id: int
    status: OrderStatus

class Item(BaseModel):
    productID: int
    quantity: int

class CreateOrder(BaseModel):
    scheduleDate: date
    items: List[Item]

class Product(BaseModel):
    product_id: int
    productName: str
    unitPrice: float

class CreateProduct(BaseModel):
    productName: str
    category: str
    unitPrice: float
    unitWeight: float
    train_space_per_unit: float
    available_units: float

class Inventory(BaseModel):
    product_id: int
    availableUnits: int

class CreateOrderWithId(BaseModel):
    customer_id: int
    scheduleDate: date
    items: List[Item]

class AllocateTrainResponse(BaseModel):
    success: bool
    message: str

# Additional schemas for DDL tables
class EmployeeType(BaseModel):
    employee_type_id: int
    type_name: str
    hourly_rate: float
    weekly_max_hours: int
    max_consecutive_trips: int

class Employee(BaseModel):
    employee_id: int
    firstName: str
    lastName: str
    type: str

class EmployeeDetailed(BaseModel):
    employee_id: int
    employee_type_id: int
    first_name: str
    last_name: str
    nic: str
    phone: str
    weekly_hours: Optional[int] = 0
    address: Optional[str] = None
    date_hired: date
    employment_status: EmploymentStatus

class TrainTrip(BaseModel):
    train_trip_id: int
    departure_city: str
    arrival_city: str
    departure_date_time: datetime
    arrival_date_time: datetime
    total_capacity: float
    available_capacity: float

class Delivery(BaseModel):
    delivery_id: int
    truck_id: int
    route_id: int
    user_id: int
    delivery_date_time: datetime
    status: DeliveryStatus
    driver_employee_id: Optional[int] = None
    assistant_employee_id: Optional[int] = None

class TrainSchedule(BaseModel):
    train_trip_id: int
    train_departure_date_time: datetime
    order_id: int
    allocated_space: float
    status: TrainScheduleStatus

class Store(BaseModel):
    store_id: int
    city: str
    address: str
    near_station_name: Optional[str] = None

class Route(BaseModel):
    route_id: int
    start_location: str
    end_location: str
    max_delivery_time: str  # INTERVAL type
    area_covered_description: Optional[str] = None

class Truck(BaseModel):
    truck_id: int
    plate_number: str
    max_load: float
    status: TruckStatus
    store_id: Optional[int] = None

class AuditLog(BaseModel):
    audit_id: int
    table_name: str
    operation: str
    performed_by: Optional[int] = None
    performed_at: datetime
    row_data: Optional[dict] = None

# Dashboard schemas
class AdminDashboardStats(BaseModel):
    total_orders: int
    pending_orders: int
    delivered_orders: int
    active_users: int
    train_utilization: float
    truck_utilization: float
    staff_active: int

class ManagerDashboardStats(BaseModel):
    active_train_trips: int
    active_truck_routes: int
    pending_orders: int
    on_time_rate: float
    upcoming_trips: List[dict]
    pending_orders_details: List[dict]

class CustomerDashboardStats(BaseModel):
    total_orders: int
    active_orders: int
    recent_orders: List[dict]

class OrderDetails(BaseModel):
    order_id: int
    status: str
    order_date: str
    schedule_date: str
    customer_name: str
    customer_city: str
    delivery_date_time: Optional[str] = None
    delivery_status: Optional[str] = None
    items: List[dict]

class OrderStatusUpdate(BaseModel):
    status: str

class PublicCustomerRegister(BaseModel):
    username: str
    password: str
    email: EmailStr
    name: str
    contactNumber: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    type: Optional[str] = "Retail"
