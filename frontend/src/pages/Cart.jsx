import { useState } from 'react'
import { getCart, updateQuantity, removeFromCart, getCartTotal } from '../cart'
import { Link } from 'react-router-dom'

const Cart = () => {
  const [cart, setCart] = useState(getCart())

  const handleQuantityChange = (wineID, newQty, maxStock) => {
    if (newQty < 1) return
    if (newQty > maxStock) return
    const updated = updateQuantity(wineID, newQty)
    setCart(updated)
  }

  const handleRemove = (wineID) => {
    const updated = removeFromCart(wineID)
    setCart(updated)
  }

  if (cart.length === 0) {
    return (
      <div>
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div>
      <h2>Your Cart</h2>
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
              <td>${item.price.toFixed(2)}</td>
              <td>
                <div className="cart-quantity">
                    <button onClick={() => handleQuantityChange(item.wineID, item.quantity - 1, item.stock_quantity)}>-</button>
                     <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.wineID, item.quantity + 1, item.stock_quantity)}>+</button>
                </div>
              </td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
              <td>
                <button onClick={() => handleRemove(item.wineID)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="cart-total">Total: ${getCartTotal().toFixed(2)}</h3>
      <Link to="/checkout"><button>Proceed to Checkout</button></Link>
    </div>
  )
}

export default Cart