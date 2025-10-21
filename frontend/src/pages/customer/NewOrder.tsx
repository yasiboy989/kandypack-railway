import { useState } from 'react'
import './NewOrder.css'

interface OrderItem {
  id: string
  product: string
  quantity: number
  price: number
}

function NewOrder() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: '1', product: '', quantity: 1, price: 0 }
  ])
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const products = [
    { id: 'p1', name: 'Product A', price: 45.99 },
    { id: 'p2', name: 'Product B', price: 78.50 },
    { id: 'p3', name: 'Product C', price: 120.00 },
    { id: 'p4', name: 'Product D', price: 35.25 },
  ]

  // Calculate minimum delivery date (7 days from now)
  const getMinDeliveryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  }

  const addItem = () => {
    setOrderItems([...orderItems, {
      id: Date.now().toString(),
      product: '',
      quantity: 1,
      price: 0
    }])
  }

  const removeItem = (id: string) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: string, value: any) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'product') {
          const product = products.find(p => p.id === value)
          updated.price = product ? product.price : 0
        }
        return updated
      }
      return item
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!deliveryDate) {
      alert('Please select a delivery date')
      return
    }
    
    if (orderItems.some(item => !item.product)) {
      alert('Please select a product for all items')
      return
    }

    console.log('Order submitted:', {
      items: orderItems,
      deliveryDate,
      deliveryAddress,
      notes,
      files,
      total: calculateTotal()
    })
    
    alert('Order placed successfully! Order ID: #' + Math.floor(Math.random() * 10000))
  }

  return (
    <div className="new-order">
      <div className="order-header">
        <div>
          <h1 className="page-title">Place New Order</h1>
          <p className="page-subtitle">Create a new delivery order (Minimum 7 days lead time)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-section">
          <h2>Order Items</h2>
          
          <div className="items-list">
            {orderItems.map((item, index) => (
              <div key={item.id} className="order-item">
                <div className="item-number">{index + 1}</div>
                
                <div className="item-fields">
                  <div className="form-group">
                    <label>Product</label>
                    <select
                      value={item.product}
                      onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${p.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Subtotal</label>
                    <div className="subtotal-value">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>

                {orderItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="btn-remove"
                    title="Remove item"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addItem} className="btn-add-item">
            ➕ Add Another Item
          </button>
        </div>

        <div className="form-section">
          <h2>Delivery Details</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="delivery-date">Delivery Date</label>
              <input
                type="date"
                id="delivery-date"
                min={getMinDeliveryDate()}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="input-field"
                required
              />
              <span className="field-hint">Minimum 7 days from today</span>
            </div>

            <div className="form-group full-width">
              <label htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter complete delivery address"
                className="input-field textarea-field"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Special Instructions (Optional)</label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special delivery instructions..."
                className="input-field textarea-field"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Supporting Documents (Optional)</h2>
          
          <div className="file-upload">
            <label htmlFor="files" className="file-upload-label">
              <div className="upload-icon">📎</div>
              <div className="upload-text">
                <div>Click to upload or drag and drop</div>
                <div className="upload-hint">PDF, DOC, or Images (Max 10MB)</div>
              </div>
            </label>
            <input
              type="file"
              id="files"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          {files.length > 0 && (
            <div className="files-list">
              {files.map((file, idx) => (
                <div key={idx} className="file-item">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="order-summary">
          <div className="summary-content">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee:</span>
              <span>$25.00</span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <span>${(calculateTotal() + 25).toFixed(2)}</span>
            </div>
          </div>

          <button type="submit" className="btn-submit-order">
            Place Order →
          </button>
        </div>
      </form>
    </div>
  )
}

export default NewOrder
