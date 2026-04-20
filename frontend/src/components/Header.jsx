import { Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@asgardeo/react'

const Header = ({ userRole }) => {
  return (
    <header>
      <h1>Tam & Pham's Winery</h1>
      <nav>
        <SignedIn>
          <Link to="/">Home</Link>
          <Link to="/wines">Wines</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Orders</Link>
          {userRole === 'admin' && (
            <>
              <Link to="/admin/wines">Admin Wines</Link>
              <Link to="/admin/customers">Admin Customers</Link>
              <Link to="/admin/orders">Admin Orders</Link>
            </>
          )}
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