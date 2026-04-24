import { useState, useEffect } from 'react'
import api from '../api'
import { addToCart, getCart } from '../cart'
import { formatCurrency } from '../utils/formatCurrency'

const FALLBACK_WINE_IMAGE =
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80'

const Body = () => {
  const [wines, setWines] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const response = await api.get('/api/wines')
        setWines(response.data)
      } catch (err) {
  console.error('Failed to fetch wines:', err)
  setError('Failed to load wines. Please try again later.')
}
    }
    fetchWines()
  }, [])

  const handleAddToCart = (wine) => {
    const cart = getCart()
    const existing = cart.find((item) => item.wineID === wine.wineID)
    const currentQty = existing ? existing.quantity : 0

    if (currentQty >= wine.stock_quantity) {
      setMessage(`Cannot add more ${wine.name} — only ${wine.stock_quantity} in stock.`)
      return
    }

    addToCart(wine, 1)
    setMessage(`${wine.name} added to cart!`)
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="wines-page">
      <div className="wines-heading">
        <h2>Our Wines</h2>
        <p>Handpicked bottles ready to be delivered to your table.</p>
      </div>

      {error && <p className="message-error">{error}</p>}

      <div className="wine-grid">
        {wines.map((wine) => (
          <article key={wine.wineID} className="wine-card">
            <img
              className="wine-card-image"
              src={wine.image_url || FALLBACK_WINE_IMAGE}
              alt={`${wine.name} bottle`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_WINE_IMAGE
              }}
            />

            <div className="wine-card-body">
              <h3>{wine.name}</h3>
              <p className="wine-meta">
                {wine.wine_type} {wine.vintage_year ? `• ${wine.vintage_year}` : ''}
              </p>
              <p className="wine-description">{wine.description || 'A curated bottle from our cellar.'}</p>

              <div className="wine-card-footer">
                <p className="wine-price">{formatCurrency(wine.price)}</p>
                <p className="wine-stock">In stock: {wine.stock_quantity}</p>
              </div>

              <button onClick={() => handleAddToCart(wine)} disabled={wine.stock_quantity <= 0}>
                {wine.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Body