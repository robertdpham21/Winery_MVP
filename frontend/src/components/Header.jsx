import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@asgardeo/react'
import { getCart } from '../cart'

const Header = ({ userRole, userName }) => {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      const cart = getCart()
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0))
    }

    updateCount()
    window.addEventListener('cart-updated', updateCount)
    return () => window.removeEventListener('cart-updated', updateCount)
  }, [])

  return (
    <header className="site-header">
      <Link to="/">
  <img src="/TP logo.png" alt="Tam & Pham's Winery" style={{ height: '50px' }} />
</Link>
      <nav>
        <SignedIn>
          <Link to="/">🏠 Home</Link>
          <Link to="/wines">🍷 Wines</Link>
          <Link to="/cart">🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ''}</Link>
          <Link to="/orders">📦 Orders</Link>
          <Link to="/profile">👤Profile</Link>
          {userRole === 'admin' && (
            <>
              <Link to="/admin/wines">⚙️ Manage Wines</Link>
              <Link to="/admin/customers">⚙️ View Users</Link>
              <Link to="/admin/orders">⚙️ Manage Orders</Link>
            </>
          )}
          {userName && <span className="header-welcome">Welcome, {userName}</span>}
          <SignOutButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </nav>
    </header>
  )
}

export default Header