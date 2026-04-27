import { useState } from 'react'
import { getCart, updateQuantity, removeFromCart, getCartSubtotal, getCartTax, getCartTotal, TAX_RATE } from '../cart'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'
import { notifyError } from '../utils/notify'

const Cart = () => {
  const [cart, setCart] = useState(getCart())
  const [message, setMessage] = useState('')


  const handleQuantityChange = (wineID, newQty, maxStock) => {
  if (newQty < 1) return
  if (newQty > maxStock) {
    const message = `Cannot exceed ${maxStock} — limited stock available.`
    setMessage(message)
    notifyError(message)
    setTimeout(() => setMessage(''), 2000)
    return
  }
  setMessage('')
  const updated = updateQuantity(wineID, newQty)
  setCart(updated)
}

  const handleRemove = (wineID) => {
    const updated = removeFromCart(wineID)
    setCart(updated)
  }

  const subtotal = getCartSubtotal()
  const tax = getCartTax()
  const total = getCartTotal()

  if (cart.length === 0) {
    return (
      <div>
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
        <Link to="/wines"><button>Shop Wines</button></Link>
      </div>
    )
  }

  return (
    <div>
      <h2>Your Cart</h2>
      {message && <p className="message-error">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Wine</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.wineID}>
              <td>{item.name}</td>
              <td>{formatCurrency(item.price)}</td>
              <td>
                <div className="cart-quantity">
                    <button onClick={() => handleQuantityChange(item.wineID, item.quantity - 1, item.stock_quantity)}>-</button>
                     <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.wineID, item.quantity + 1, item.stock_quantity)}>+</button>
                </div>
              </td>
              <td>{formatCurrency(item.price * item.quantity)}</td>
              <td>
                <button onClick={() => handleRemove(item.wineID)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="cart-total">Subtotal: {formatCurrency(subtotal)}</h3>
      <p>Tax ({(TAX_RATE * 100).toFixed(2)}%): {formatCurrency(tax)}</p>
      <h3 className="cart-total">Total: {formatCurrency(total)}</h3>
      <Link to="/wines"><button>Shop Wines</button></Link>
      <Link to="/checkout"><button>Proceed to Checkout</button></Link>
    </div>
  )
}

export default Cart