import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api'
import { getCart, clearCart } from '../cart'
import { formatCurrency } from '../utils/formatCurrency'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [total, setTotal] = useState(0)
  const cart = getCart()

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const items = cart.map((item) => ({ wineID: item.wineID, quantity: item.quantity }))
        const response = await api.post('/api/payments/create-intent', { items })
        setClientSecret(response.data.clientSecret)
        setTotal(response.data.total)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to initialize payment')
      }
    }

    if (cart.length > 0) {
      createPaymentIntent()
    }
  }, [])

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
        navigate('/orders')
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to create order')
      }
    }

    setLoading(false)
  }

  if (cart.length === 0) {
    return <p>Your cart is empty.</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Total: {formatCurrency(total)}</h3>
      <div className="stripe-card">
        <CardElement />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay ${formatCurrency(total)}`}
      </button>
    </form>
  )
}

const Checkout = () => {
  return (
    <div>
      <h2>Checkout</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}

export default Checkout