import { useState, useEffect } from 'react'
import api from '../api'
import { addToCart, getCart } from '../cart'
import { formatCurrency } from '../utils/formatCurrency'
import { notifyError, notifySuccess } from '../utils/notify'

const FALLBACK_WINE_IMAGE =
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80'

const formatWineType = (type) => {
  if (!type) return ''
  return type
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const Body = () => {
  const [wines, setWines] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('name_asc')
  const [typeFilter, setTypeFilter] = useState('all')
  const [vintageFilter, setVintageFilter] = useState('all')

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const response = await api.get('/api/wines')
        setWines(response.data)
      } catch (err) {
  console.error('Failed to fetch wines:', err)
  setError('Failed to load wines. Please try again later.')
  notifyError('Failed to load wines. Please try again later.')
}
    }
    fetchWines()
  }, [])

  const handleAddToCart = (wine) => {
    const cart = getCart()
    const existing = cart.find((item) => item.wineID === wine.wineID)
    const currentQty = existing ? existing.quantity : 0

    if (currentQty >= wine.stock_quantity) {
      const message = `Cannot add more ${wine.name} — only ${wine.stock_quantity} in stock.`
      setMessage(message)
      notifyError(message)
      return
    }

    addToCart(wine, 1)
    const message = `${wine.name} added to cart!`
    setMessage(message)
    notifySuccess(message)
    setTimeout(() => setMessage(''), 2000)
  }

  const wineTypes = [...new Set(wines.map((wine) => wine.wine_type).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )
  const vintageYears = [...new Set(wines.map((wine) => wine.vintage_year).filter(Boolean))].sort((a, b) =>
    b - a
  )

  const displayedWines = wines
    .filter((wine) => (typeFilter === 'all' ? true : wine.wine_type === typeFilter))
    .filter((wine) => (vintageFilter === 'all' ? true : String(wine.vintage_year) === vintageFilter))
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
      if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price)
      if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price)
      return 0
    })

  return (
    <div className="wines-page">
      <div className="wines-heading">
        <h2>Our Wines</h2>
        <p>Handpicked bottles ready to be delivered to your table.</p>
      </div>

      <div className="wine-controls">
        <label>
          Sort by
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name_asc">Name (A-Z)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
          </select>
        </label>

        <label>
          Type
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            {wineTypes.map((type) => (
              <option key={type} value={type}>{formatWineType(type)}</option>
            ))}
          </select>
        </label>

        <label>
          Vintage Year
          <select value={vintageFilter} onChange={(e) => setVintageFilter(e.target.value)}>
            <option value="all">All Years</option>
            {vintageYears.map((year) => (
              <option key={year} value={String(year)}>{year}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="message-error">{error}</p>}
      {message && <p className="message-success">{message}</p>}

      <div className="wine-grid">
        {displayedWines.map((wine) => (
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
                {formatWineType(wine.wine_type)} {wine.vintage_year ? `• ${wine.vintage_year}` : ''}
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
      {displayedWines.length === 0 && <p>No wines match your selected filters.</p>}
    </div>
  )
}

export default Body