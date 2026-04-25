import { useState, useEffect } from 'react'
import api from '../api'
import { formatCurrency } from '../utils/formatCurrency'
import { formatOrderStatus } from '../utils/formatOrderStatus'

const ORDER_TABS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'ready_for_pickup', label: 'Ready for Pick Up' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'cancelled', label: 'Cancelled' },
]

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders')
      setOrders(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter((order) => order.order_status === activeTab)

    const handleStatusChange = async (orderID, newStatus) => {
      setUpdatingOrderId(orderID)
      setError('')
    
      try {
        await api.put(`/api/orders/${orderID}`, { order_status: newStatus })
        await fetchOrders() 
        setActiveTab(newStatus) // then switch tab — data is ready
        setMessage(`Order #${orderID} updated to ${formatOrderStatus(newStatus).label}`)
        setTimeout(() => setMessage(''), 2000)
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to update order status')
        console.error(err)
      } finally {
        setUpdatingOrderId(null)
      }
    }

  return (
    <div>
      <h2>Manage Orders</h2>
      {message && <p className="message-success">{message}</p>}
      {error && <p className="message-error">{error}</p>}

      <div className="order-tabs" role="tablist" aria-label="Admin order filters">
        {ORDER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`order-tab${activeTab === tab.value ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
            role="tab"
            aria-selected={activeTab === tab.value}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p>No orders match the selected status.</p>
      ) : filteredOrders.map((order) => {
        const status = formatOrderStatus(order.order_status)

        return (
          <div key={order.orderID} className="order-card">
            <h3>Order #{order.orderID}</h3>
            <p>Customer: {order.user?.FirstName} {order.user?.LastName} ({order.user?.Email})</p>
            <p>Date: {new Date(order.ordered_at).toLocaleDateString()}</p>
            <p className="order-status-row">
              Status:{' '}
              <span className={`order-status-badge ${status.className}`}>
                {status.label}
              </span>
            </p>
            <p>Payment: {order.payment_status}</p>

            <table>
              <thead>
                <tr>
                  <th>Wine</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item) => (
                  <tr key={item.linkingID}>
                    <td>{item.wine?.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{formatCurrency(item.quantity * parseFloat(item.unit_price))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Total: {formatCurrency(order.total_amount)}</h4>

            {order.order_status !== 'picked_up' && order.order_status !== 'cancelled' && (
              <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
                {order.order_status === 'pending' && (
                  <>
                      <button className="btn-small" disabled={updatingOrderId === order.orderID} onClick={() => handleStatusChange(order.orderID, 'ready_for_pickup')}>Mark Ready for Pickup</button>
                      <button className="btn-small" disabled={updatingOrderId === order.orderID} onClick={() => handleStatusChange(order.orderID, 'cancelled')}>Cancel Order</button>
                  </>
                )}
                {order.order_status === 'ready_for_pickup' && (
                    <button className="btn-small" disabled={updatingOrderId === order.orderID} onClick={() => handleStatusChange(order.orderID, 'picked_up')}>Mark Picked Up</button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default AdminOrders