import './StoreStockView.css'
import { useEffect, useState } from 'react'
import { getStores, getProducts, type Store, type Product } from '../../lib/api'

interface ProductWithDetails extends Product {
  available_units?: number
  category?: string
}

function StoreStockView() {
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      const [storesData, productsData] = await Promise.all([
        getStores(),
        getProducts()
      ])

      setStores(storesData)
      setProducts(productsData)

      if (storesData.length > 0) {
        setSelectedStoreId(storesData[0].store_id)
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store data')
      console.error('Failed to load store data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.productName?.toLowerCase().includes(term)
      )
    }

    setFilteredProducts(filtered)
  }

  const getStockStatus = (units?: number) => {
    if (units === undefined) return 'unknown'
    if (units === 0) return 'out-of-stock'
    if (units < 50) return 'low'
    if (units < 150) return 'medium'
    return 'healthy'
  }

  const selectedStore = stores.find(s => s.store_id === selectedStoreId)
  const totalUnits = filteredProducts.reduce((sum, p) => sum + (p.available_units || 0), 0)
  const lowStockCount = filteredProducts.filter(p => (p.available_units || 0) < 50).length

  if (loading) {
    return (
      <div className="store-stock-page">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading store inventory...</div>
      </div>
    )
  }

  return (
    <div className="store-stock-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Stock View</h1>
          <p className="page-subtitle">Manage inventory for warehouse locations</p>
        </div>
      </div>

      {error && <div className="alert error-alert">{error}</div>}

      <div className="store-selector-section">
        <label className="store-label">Select Store:</label>
        <select
          value={selectedStoreId || ''}
          onChange={(e) => setSelectedStoreId(parseInt(e.target.value))}
          className="store-select"
        >
          <option value="">Choose a store...</option>
          {stores.map(store => (
            <option key={store.store_id} value={store.store_id}>
              {store.city} - {store.address}
            </option>
          ))}
        </select>
      </div>

      {selectedStore && (
        <div className="store-info-section">
          <div className="store-details">
            <h2 className="store-name">{selectedStore.city} Store</h2>
            <div className="store-location">
              <p><strong>Address:</strong> {selectedStore.address}</p>
              {selectedStore.near_station_name && (
                <p><strong>Near:</strong> {selectedStore.near_station_name}</p>
              )}
            </div>
          </div>

          <div className="store-stats">
            <div className="stat-box">
              <div className="stat-label">Total Products</div>
              <div className="stat-value">{filteredProducts.length}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Units</div>
              <div className="stat-value">{totalUnits.toLocaleString()}</div>
            </div>
            <div className="stat-box alert-stat">
              <div className="stat-label">Low Stock Items</div>
              <div className="stat-value">{lowStockCount}</div>
            </div>
          </div>
        </div>
      )}

      <div className="search-section">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Available Units</th>
              <th>Stock Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.available_units)
                const stockValue = (product.available_units || 0) * (product.unitPrice || 0)

                return (
                  <tr key={product.product_id} className={`inventory-row ${stockStatus}`}>
                    <td className="product-name-cell">
                      <span className="product-name">{product.productName}</span>
                    </td>
                    <td>
                      <span className="category-tag">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="price-cell">
                      ${(product.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="units-cell">
                      <span className={`units-value ${stockStatus}`}>
                        {product.available_units || 0}
                      </span>
                    </td>
                    <td className="value-cell">
                      ${stockValue.toFixed(2)}
                    </td>
                    <td className="status-cell">
                      <span className={`status-label ${stockStatus}`}>
                        {stockStatus === 'out-of-stock' && 'Out of Stock'}
                        {stockStatus === 'low' && 'Low Stock'}
                        {stockStatus === 'medium' && 'Medium'}
                        {stockStatus === 'healthy' && 'Healthy'}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="empty-row">
                  {stores.length === 0
                    ? 'No stores available'
                    : filteredProducts.length === 0 && searchTerm
                    ? 'No products match your search'
                    : 'No products available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedStore && filteredProducts.length > 0 && (
        <div className="summary-section">
          <div className="summary-card">
            <h3>Summary for {selectedStore.city}</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span>Healthy Stock:</span>
                <span>{filteredProducts.filter(p => getStockStatus(p.available_units) === 'healthy').length} products</span>
              </div>
              <div className="summary-item">
                <span>Medium Stock:</span>
                <span>{filteredProducts.filter(p => getStockStatus(p.available_units) === 'medium').length} products</span>
              </div>
              <div className="summary-item">
                <span>Low Stock:</span>
                <span>{filteredProducts.filter(p => getStockStatus(p.available_units) === 'low').length} products</span>
              </div>
              <div className="summary-item">
                <span>Out of Stock:</span>
                <span>{filteredProducts.filter(p => getStockStatus(p.available_units) === 'out-of-stock').length} products</span>
              </div>
              <div className="summary-item total-value">
                <span>Total Inventory Value:</span>
                <span>${filteredProducts.reduce((sum, p) => sum + ((p.available_units || 0) * (p.unitPrice || 0)), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreStockView
