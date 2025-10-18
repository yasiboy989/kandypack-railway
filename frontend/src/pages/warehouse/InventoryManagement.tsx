import { useState } from 'react'
import './InventoryManagement.css'

interface Product {
  id: string
  name: string
  category: string
  stock: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([
    { id: 'PROD001', name: 'Premium Rice 5kg', category: 'Grains', stock: 250, status: 'in-stock' },
    { id: 'PROD002', name: 'Organic Flour 1kg', category: 'Flour', stock: 15, status: 'low-stock' },
    { id: 'PROD003', name: 'Tea Leaves 250g', category: 'Beverages', stock: 5, status: 'low-stock' },
    { id: 'PROD004', name: 'Cinnamon Sticks 50g', category: 'Spices', stock: 0, status: 'out-of-stock' },
  ])

  return (
    <div className="inventory-management">
      <div className="page-header">
        <h1>Inventory Management</h1>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Search products..." className="search-input" />
        <select className="filter-select">
          <option>All Categories</option>
          <option>Grains</option>
          <option>Flour</option>
          <option>Beverages</option>
          <option>Spices</option>
        </select>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status-badge ${product.status}`}>
                    {product.status.replace('-', ' ')}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-primary">Adjust Stock</button>
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

export default InventoryManagement