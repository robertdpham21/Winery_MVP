import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api'
import { getCart, clearCart, TAX_RATE } from '../cart'
import { formatCurrency } from '../utils/formatCurrency'
import { notifyError, notifySuccess } from '../utils/notify'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const CHECKOUT_WINE_IMAGE = 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2luZXN8ZW58MHx8MHx8fDA%3D'

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)
  const cart = getCart()

  useEffect(() => {
    const createPaymentIntent = async () => {
      const currentCart = getCart()
      const fallbackSubtotal = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const fallbackTax = fallbackSubtotal * TAX_RATE
      const fallbackTotal = fallbackSubtotal + fallbackTax

      try {
        const items = currentCart.map((item) => ({ wineID: item.wineID, quantity: item.quantity }))
        const response = await api.post('/api/payments/create-intent', { items })
        const apiSubtotal = response.data.subtotal ?? fallbackSubtotal
        const apiTax = response.data.tax ?? apiSubtotal * TAX_RATE
        const apiTotal = apiSubtotal + apiTax

        setClientSecret(response.data.clientSecret)
        setSubtotal(apiSubtotal)
        setTax(apiTax)
        setTotal(apiTotal)
      } catch (err) {
        const message = err.response?.data?.error || 'Failed to initialize payment'
        setSubtotal(fallbackSubtotal)
        setTax(fallbackTax)
        setTotal(fallbackTotal)
        setError(message)
        notifyError(message)
      }
    }

    if (cart.length > 0) {
      createPaymentIntent()
    }
  }, [cart.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    })

    if (stripeError) {
      setError(stripeError.message)
      notifyError(stripeError.message)
      setLoading(false)
      return
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        const items = cart.map((item) => ({ wineID: item.wineID, quantity: item.quantity }))
        await api.post('/api/orders', {
          items,
          stripe_payment_id: paymentIntent.id,
        })
        clearCart()
        localStorage.removeItem('winery_cart')
        notifySuccess('Order placed successfully!')
        navigate('/orders')
      } catch (err) {
        const message = err.response?.data?.error || 'Failed to create order'
        setError(message)
        notifyError(message)
      }
    }

    setLoading(false)
  }

  if (cart.length === 0) {
    return <p>Your cart is empty.</p>
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-summary">
        <p>Subtotal: {formatCurrency(subtotal)}</p>
        <p>Tax ({(TAX_RATE * 100).toFixed(2)}%): {formatCurrency(tax)}</p>
        <h3>Total: {formatCurrency(total)}</h3>
      </div>

      <div className="stripe-card">
        <CardElement />
      </div>

      {error && <p className="message-error">{error}</p>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
      </button>
    </form>
  )
}

const Checkout = () => {
  return (
    <div className="checkout-page">
      <section>
        <h2>Checkout</h2>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </section>

      <aside className="checkout-visual" aria-label="Wine showcase image">
        <img src={CHECKOUT_WINE_IMAGE} alt="Wine bottle and glass on a tasting table" loading="lazy" />
        <div className="checkout-visual-content">
          <p>Every bottle is prepared with care for pickup at Tam & Pham's Winery.</p>
        </div>
      </aside>
    </div>
  )
}

export default Checkout