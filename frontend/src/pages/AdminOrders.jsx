import { useState, useEffect } from 'react'
import api from '../api'
import { formatCurrency } from '../utils/formatCurrency'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState('')

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders')
      setOrders(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusChange = async (orderID, newStatus) => {
    try {
      await api.put(`/api/orders/${orderID}`, { order_status: newStatus })
      setMessage(`Order #${orderID} updated to ${newStatus}`)
      fetchOrders()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h2>Manage Orders</h2>
      {message && <p className="message-success">{message}</p>}

      {orders.map((order) => (
        <div key={order.orderID} className="order-card">
          <h3>Order #{order.orderID}</h3>
          <p>Customer: {order.user?.FirstName} {order.user?.LastName} ({order.user?.Email})</p>
          <p>Date: {new Date(order.ordered_at).toLocaleDateString()}</p>
          <p>Status: <strong>{order.order_status}</strong></p>
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

          {order.order_status !== 'completed' && order.order_status !== 'cancelled' && (
            <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
              {order.order_status === 'pending' && (
                <>
                  <button className="btn-small" onClick={() => handleStatusChange(order.orderID, 'ready_for_pickup')}>Mark Ready for Pickup</button>
                  <button className="btn-small" onClick={() => handleStatusChange(order.orderID, 'cancelled')}>Cancel Order</button>
                </>
              )}
              {order.order_status === 'ready_for_pickup' && (
                <button className="btn-small" onClick={() => handleStatusChange(order.orderID, 'completed')}>Mark Completed</button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default AdminOrders