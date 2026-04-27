import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, useAsgardeo } from '@asgardeo/react'
import api, { setAuthToken } from './api'
import { setCartUser } from './cart'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Wines from './pages/Wines'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Checkout from './pages/Checkout'
import CompleteProfile from './pages/CompleteProfile'
import AdminWines from './pages/AdminWines'
import AdminCustomers from './pages/AdminCustomers'
import AdminOrders from './pages/AdminOrders'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

import './App.css'

function AppContent({ userRole, setUserRole, setUserName }) {
  const { getAccessToken } = useAsgardeo()
  const [profileStatus, setProfileStatus] = useState('loading')

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = await getAccessToken()
        setAuthToken(token)
        const response = await api.get('/api/users/me')
        setProfileStatus('complete')
        setUserRole(response.data.role || 'customer')
        setUserName(response.data.FirstName || '')
        setCartUser(response.data.userID)
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setUserName('')
          setCartUser(null)
          setProfileStatus('incomplete')
        } else {
          console.error('Profile check failed:', err)
          setUserName('')
          setCartUser(null)
          setProfileStatus('error')
        }
      }
    }

    checkProfile()
  }, [getAccessToken, setUserName, setUserRole])

  if (profileStatus === 'loading') {
    return <main><p>Loading...</p></main>
  }

  if (profileStatus === 'incomplete') {
    return (
      <main>
        <Routes>
          <Route path="/complete-profile" element={<CompleteProfile onComplete={() => setProfileStatus('complete')} />} />
          <Route path="*" element={<Navigate to="/complete-profile" />} />
        </Routes>
      </main>
    )
  }

  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wines" element={<Wines />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout />} />
        
        {userRole === 'admin' && (
          <>
            <Route path="/admin/wines" element={<AdminWines />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  )
}

function App() {
  const [userRole, setUserRole] = useState('customer')
  const [userName, setUserName] = useState('')
  const [notification, setNotification] = useState(null)
  const notificationTimerRef = useRef(null)

  useEffect(() => {
    const handleNotification = (event) => {
      const detail = event.detail || {}

      if (!detail.message) return

      setNotification({ type: detail.type || 'success', message: detail.message })

      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current)
      }

      notificationTimerRef.current = window.setTimeout(() => {
        setNotification(null)
      }, 3500)
    }

    window.addEventListener('winery-notification', handleNotification)

    return () => {
      window.removeEventListener('winery-notification', handleNotification)
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current)
      }
    }
  }, [])

  return (
    <BrowserRouter>
      <Header userRole={userRole} userName={userName} />
      {notification && (
        <div className={`app-notification app-notification-${notification.type}`} role="status" aria-live="polite">
          {notification.message}
        </div>
      )}
      <SignedOut>
        <main className="welcome-section">
          <h2>Welcome to Tam & Pham's Winery</h2>
          <p>Please sign in to browse our wines.</p>
        </main>
      </SignedOut>
      <SignedIn>
        <AppContent userRole={userRole} setUserRole={setUserRole} setUserName={setUserName} />
      </SignedIn>
      <Footer />
    </BrowserRouter>
  )
}

export default App