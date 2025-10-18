import { useState } from 'react'
import './OrdersManagement.css'

interface Order {
  id: string
  customerName: string
  orderDate: string
  total: number
  status: 'pending' | 'scheduled' | 'in-transit' | 'delivered'
}

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD001', customerName: 'John Carter', orderDate: '2024-01-30', total: 2500, status: 'delivered' },
    { id: 'ORD002', customerName: 'Sophie Moore', orderDate: '2024-01-29', total: 1500, status: 'in-transit' },
    { id: 'ORD003', customerName: 'Matt Cannon', orderDate: '2024-01-28', total: 3500, status: 'scheduled' },
    { id: 'ORD004', customerName: 'Graham Hills', orderDate: '2024-01-27', total: 1000, status: 'pending' },
  ])

  return (
    <div className="orders-management">
      <div className="page-header">
        <h1>Orders Management</h1>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Search orders..." className="search-input" />
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Scheduled</option>
          <option>In-transit</option>
          <option>Delivered</option>
        </select>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Order Date</th>
              <th>Total (LKR)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.orderDate}</td>
                <td>{order.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-primary">View Details</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrdersManagement