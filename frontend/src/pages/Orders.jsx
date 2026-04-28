import { useState, useEffect } from 'react'
import api from '../api'
import { formatCurrency } from '../utils/formatCurrency'
import { formatOrderStatus } from '../utils/formatOrderStatus'
import { notifyError } from '../utils/notify'

const TAX_RATE = 0.0825

const ORDER_TABS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'ready_for_pickup', label: 'Ready for Pick Up' },
  { value: 'picked_up', label: 'Picked Up' },
]

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/users/me/orders')
        setOrders(response.data)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load orders. Please try again later.')
        notifyError('Failed to load orders. Please try again later.')
      }
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter((order) => order.order_status === activeTab)
  const activeTabLabel = ORDER_TABS.find((tab) => tab.value === activeTab)?.label.toLowerCase() || 'orders'

  if (loading) return <p>Loading orders...</p>

  if (error) {
    return (
      <div>
        <h2>Your Orders</h2>
        <p className="message-error">{error}</p>
      </div>
    )
  }

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
      <div className="order-tabs" role="tablist" aria-label="Order filters">
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
        <p>{activeTab === 'all' ? 'You do not have any orders yet.' : `You do not have any ${activeTabLabel} orders yet.`}</p>
      ) : (
        filteredOrders.map((order) => {
          const status = formatOrderStatus(order.order_status)
          const subtotal = order.order_items?.reduce((sum, item) => sum + item.quantity * parseFloat(item.unit_price), 0) || 0
          const tax = subtotal * TAX_RATE
          const total = subtotal + tax

          return (
            <div key={order.orderID} className="order-card">
              <h3>Order #{order.orderID}</h3>
              <p>
                Date: {new Date(order.ordered_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
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
              <p>Subtotal: {formatCurrency(subtotal)}</p>
              <p>Tax ({(TAX_RATE * 100).toFixed(2)}%): {formatCurrency(tax)}</p>
              <h4>Total: {formatCurrency(total)}</h4>
            </div>
          )
        })
      )}
    </div>
  )
}

export default Orders