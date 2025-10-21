import { useState } from 'react'
import { useWarehouse } from './WarehouseContext'
import './InventoryManagement.css'

interface Product {
  id: string
  name: string
  category: string
  stock: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

function InventoryManagement() {
  const { isKandy, selectedBranch } = useWarehouse()
  const [products, setProducts] = useState<Product[]>([
    { id: 'PROD001', name: 'Premium Rice 5kg', category: 'Grains', stock: 250, status: 'in-stock' },
    { id: 'PROD002', name: 'Organic Flour 1kg', category: 'Flour', stock: 15, status: 'low-stock' },
    { id: 'PROD003', name: 'Tea Leaves 250g', category: 'Beverages', stock: 5, status: 'low-stock' },
    { id: 'PROD004', name: 'Cinnamon Sticks 50g', category: 'Spices', stock: 0, status: 'out-of-stock' },
  ])
  const [adjusting, setAdjusting] = useState<Product | null>(null)
  const [newStock, setNewStock] = useState<number | ''>('')

  const openAdjust = (p: Product) => {
    setAdjusting(p)
    setNewStock(p.stock)
  }

  const statusFromStock = (s: number): Product['status'] => {
    if (s <= 0) return 'out-of-stock'
    if (s < 20) return 'low-stock'
    return 'in-stock'
  }

  const saveAdjust = () => {
    if (adjusting == null) return
    const val = typeof newStock === 'number' ? newStock : parseInt(String(newStock), 10)
    const safe = isFinite(val) && val >= 0 ? val : adjusting.stock
    setProducts(prev => prev.map(p => p.id === adjusting.id ? { ...p, stock: safe, status: statusFromStock(safe) } : p))
    setAdjusting(null)
    setNewStock('')
  }

  if (!isKandy) {
    return (
      <div className="inventory-management">
        <div className="page-header">
          <h1>Inventory Management</h1>
        </div>
        <div style={{ padding: '0.75rem 1rem', color: 'var(--neutral-400)' }}>
          Inventory adjustments are only available for the Kandy branch. Selected branch: <strong>{selectedBranch}</strong>.
        </div>
      </div>
    )
  }

  return (
    <div className="inventory-management">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <div className="branch-chip">{selectedBranch}</div>
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
                    <button className="btn-primary" onClick={() => openAdjust(product)}>Adjust Stock</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {adjusting && (
        <div className="modal-overlay" onClick={() => setAdjusting(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adjust Stock</h2>
              <button className="modal-close" onClick={() => setAdjusting(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 10, color: 'var(--neutral-300)' }}>
                <div><strong>{adjusting.name}</strong> ({adjusting.id})</div>
                <div>Current stock: {adjusting.stock}</div>
              </div>
              <label htmlFor="new-stock" style={{ display: 'block', marginBottom: 6 }}>New stock level</label>
              <input
                id="new-stock"
                className="input-field"
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                style={{ width: 180 }}
              />
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="btn-secondary" onClick={() => setNewStock((typeof newStock === 'number' ? newStock : parseInt(String(newStock) || '0', 10)) + 10)}>+10</button>
                <button className="btn-secondary" onClick={() => setNewStock(Math.max(0, (typeof newStock === 'number' ? newStock : parseInt(String(newStock) || '0', 10)) - 10))}>-10</button>
                <button className="btn-secondary" onClick={() => setNewStock(adjusting.stock)}>Reset</button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setAdjusting(null)}>Cancel</button>
              <button className="btn-success" onClick={saveAdjust} disabled={newStock === ''}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryManagement