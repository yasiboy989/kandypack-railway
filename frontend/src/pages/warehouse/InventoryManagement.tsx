import './InventoryManagement.css'
import { useEffect, useState } from 'react'
import { SearchIcon, EditIcon, SaveIcon, XIcon } from '../../components/Icons'
import { getProducts, updateProductStock, type Product } from '../../lib/api'

interface ProductWithDetails extends Product {
  category?: string
  available_units?: number
  unit_price?: number
}

function InventoryManagement() {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<{ units: number }>({ units: 0 })
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const categories = ['all', ...new Set(products.map(p => p.category || 'uncategorized'))]

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        p => p.productName?.toLowerCase().includes(term)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => (p.category || 'uncategorized') === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const startEditing = (product: ProductWithDetails) => {
    setEditingId(product.product_id)
    setEditValues({ units: product.available_units || 0 })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValues({ units: 0 })
  }

  const saveEdit = async (productId: number) => {
    try {
      setSaving(true)
      await updateProductStock(productId, editValues.units)

      setProducts(products.map(p =>
        p.product_id === productId
          ? { ...p, available_units: editValues.units }
          : p
      ))

      setEditingId(null)
      setSuccessMessage('Stock updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to update stock:', err)
      setError(err instanceof Error ? err.message : 'Failed to update stock')
    } finally {
      setSaving(false)
    }
  }

  const getStockStatus = (units?: number) => {
    if (units === undefined) return 'unknown'
    if (units === 0) return 'out-of-stock'
    if (units < 50) return 'low'
    if (units < 150) return 'medium'
    return 'healthy'
  }

  if (loading) {
    return (
      <div className="inventory-page">
        <div style={{ padding: '24px', textAlign: 'center' }}>Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">View and manage product stock levels</p>
        </div>
        <div className="header-stats">
          <span className="stat-badge">Total Products: {filteredProducts.length}</span>
        </div>
      </div>

      {error && <div className="alert error-alert">{error}</div>}
      {successMessage && <div className="alert success-alert">{successMessage}</div>}

      <div className="filters-section">
        <div className="search-box">
          <SearchIcon size={18} />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Available Units</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => {
                const isEditing = editingId === product.product_id
                const stockStatus = getStockStatus(product.available_units)

                return (
                  <tr key={product.product_id} className={`product-row ${stockStatus}`}>
                    <td className="product-name-cell">
                      <div className="product-name">{product.productName}</div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="price-cell">
                      ${(product.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="units-cell">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editValues.units}
                          onChange={(e) => setEditValues({ units: parseInt(e.target.value) || 0 })}
                          className="edit-input"
                          autoFocus
                        />
                      ) : (
                        <span className={`units-value ${stockStatus}`}>
                          {product.available_units || 0}
                        </span>
                      )}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${stockStatus}`}>
                        {stockStatus === 'out-of-stock' && 'Out of Stock'}
                        {stockStatus === 'low' && 'Low Stock'}
                        {stockStatus === 'medium' && 'Medium'}
                        {stockStatus === 'healthy' && 'Healthy'}
                        {stockStatus === 'unknown' && 'Unknown'}
                      </span>
                    </td>
                    <td className="action-cell">
                      {isEditing ? (
                        <div className="action-buttons">
                          <button
                            onClick={() => saveEdit(product.product_id)}
                            disabled={saving}
                            className="btn-save"
                            title="Save"
                          >
                            <SaveIcon size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="btn-cancel"
                            title="Cancel"
                          >
                            <XIcon size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(product)}
                          className="btn-edit"
                          title="Edit stock"
                        >
                          <EditIcon size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="empty-row">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryManagement
