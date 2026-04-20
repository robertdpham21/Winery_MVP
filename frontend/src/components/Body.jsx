import { useState, useEffect } from 'react'
import api from '../api'
import { addToCart, getCart } from '../cart'

const Body = () => {
  const [wines, setWines] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const response = await api.get('/api/wines')
        setWines(response.data)
      } catch (err) {
        console.error('Failed to fetch wines:', err)
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
    <div>
      <h2>Our Wines</h2>
      {message && <p>{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Year</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {wines.map((wine) => (
            <tr key={wine.wineID}>
              <td>{wine.name}</td>
              <td>{wine.wine_type}</td>
              <td>{wine.vintage_year}</td>
              <td>${wine.price}</td>
              <td>{wine.stock_quantity}</td>
              <td>{wine.description}</td>
              <td>
                <button onClick={() => handleAddToCart(wine)}>Add to Cart</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Body