import { useState, useEffect } from 'react'
import api from '../api'
import { formatCurrency } from '../utils/formatCurrency'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/users/me/orders')
        setOrders(response.data)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
      }
      setLoading(false)
    }
    fetchOrders()
  }, [])

  if (loading) return <p>Loading orders...</p>

  if (orders.length === 0) {
    return (
      <div>
        <h2>Your Orders</h2>
        <p>You have no orders yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div key={order.orderID} className="order-card">
          <h3>Order #{order.orderID}</h3>
          <p>Date: {new Date(order.ordered_at).toLocaleDateString()}</p>
          <p>Status: {order.order_status}</p>
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
        </div>
      ))}
    </div>
  )
}

export default Orders