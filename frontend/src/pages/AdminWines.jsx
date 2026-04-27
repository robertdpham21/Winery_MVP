import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import { formatCurrency } from '../utils/formatCurrency'
import { notifyError, notifySuccess } from '../utils/notify'

const formatWineType = (type) => {
  if (!type) return ''

  return type
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const AdminWines = () => {
  const currentYear = new Date().getFullYear()

  const [wines, setWines] = useState([])
  const [form, setForm] = useState({
    name: '', wine_type: 'red', description: '', vintage_year: '', price: '', stock_quantity: '', image_url: ''
  })
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const [sortBy, setSortBy] = useState('name_asc')

  const fetchWines = useCallback(async () => {
    try {
      const response = await api.get('/api/wines?all=true')
      setWines(response.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      fetchWines()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [fetchWines])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const parsedPrice = Number(form.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      const message = 'Price must be greater than 0'
      setMessage(message)
      notifyError(message)
      return
    }

    const parsedStock = Number(form.stock_quantity)
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      const message = 'Stock must be a whole number 0 or greater'
      setMessage(message)
      notifyError(message)
      return
    }

    if (form.vintage_year !== '') {
      const parsedVintageYear = Number(form.vintage_year)
      if (!Number.isInteger(parsedVintageYear) || parsedVintageYear >= currentYear) {
        const message = `Vintage year must be before ${currentYear}`
        setMessage(message)
        notifyError(message)
        return
      }
    }

    try {
      if (editing) {
        await api.put(`/api/wines/${editing}`, form)
        setMessage('Wine updated!')
        notifySuccess('Wine updated!')
      } else {
        await api.post('/api/wines', form)
        setMessage('Wine created!')
        notifySuccess('Wine created!')
      }
      setForm({ name: '', wine_type: 'red', description: '', vintage_year: '', price: '', stock_quantity: '', image_url: '' })
      setEditing(null)
      fetchWines()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to save wine'
      setMessage(message)
      notifyError(message)
    }
  }

  const handleEdit = (wine) => {
    setForm({
      name: wine.name,
      wine_type: wine.wine_type,
      description: wine.description || '',
      vintage_year: wine.vintage_year || '',
      price: wine.price,
      stock_quantity: wine.stock_quantity,
      image_url: wine.image_url || '',
    })
    setEditing(wine.wineID)
  }

  const handleToggleActive = async (wine) => {
    try {
      await api.put(`/api/wines/${wine.wineID}`, { is_active: !wine.is_active })
      fetchWines()
    } catch (err) {
      console.error(err)
    }
  }

  const sortedWines = [...wines].sort((leftWine, rightWine) => {
    if (sortBy === 'name_asc') return leftWine.name.localeCompare(rightWine.name)
    if (sortBy === 'name_desc') return rightWine.name.localeCompare(leftWine.name)
    if (sortBy === 'price_asc') return parseFloat(leftWine.price) - parseFloat(rightWine.price)
    if (sortBy === 'price_desc') return parseFloat(rightWine.price) - parseFloat(leftWine.price)
    if (sortBy === 'year_asc') return (leftWine.vintage_year || 0) - (rightWine.vintage_year || 0)
    if (sortBy === 'year_desc') return (rightWine.vintage_year || 0) - (leftWine.vintage_year || 0)
    return 0
  })

  return (
    <div>
      <h2>Manage Wines</h2>
      {message && <p className="message-success">{message}</p>}


      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Type:</label>
          <select name="wine_type" value={form.wine_type} onChange={handleChange}>
            <option value="red">Red</option>
            <option value="white">White</option>
            <option value="rosé">Rosé</option>
            <option value="sparkling">Sparkling</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>
        <div>
          <label>Description:</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>
        <div>
          <label>Vintage Year:</label>
          <input type="number" name="vintage_year" value={form.vintage_year} onChange={handleChange} min="1000" max={currentYear - 1} />
        </div>
        <div>
          <label>Price:</label>
          <input type="number" step="0.01" min="1.00" name="price" value={form.price} onChange={handleChange} required />
        </div>
        <div>
          <label>Stock:</label>
          <input type="number" min="0" step="1" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} required />
        </div>
        <div>
          <label>Image URL:</label>
          <input type="text" name="image_url" value={form.image_url} onChange={handleChange} />
        </div>
        <button type="submit">{editing ? 'Update Wine' : 'Add Wine'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', wine_type: 'red', description: '', vintage_year: '', price: '', stock_quantity: '', image_url: '' }) }}>Cancel</button>}
      </form>

      <div className="table-controls">
        <label>
          Sort wines
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="year_desc">Vintage Year (Newest)</option>
            <option value="year_asc">Vintage Year (Oldest)</option>
          </select>
        </label>
      </div>
      
      <table className="manage-wines-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Year</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedWines.map((wine) => (
            <tr key={wine.wineID}>
              <td>{wine.name}</td>
              <td>{formatWineType(wine.wine_type)}</td>
              <td>{wine.vintage_year}</td>
              <td>{formatCurrency(wine.price)}</td>
              <td>{wine.stock_quantity}</td>
              <td>{wine.is_active ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn-small" onClick={() => handleEdit(wine)}>Edit</button>
                <button
                  className={`btn-small ${wine.is_active ? 'btn-deactivate' : 'btn-activate'}`}
                  onClick={() => handleToggleActive(wine)}
                >
                  {wine.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminWines