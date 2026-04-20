import { useState, useEffect } from 'react'
import api from '../api'

const AdminWines = () => {
  const [wines, setWines] = useState([])
  const [form, setForm] = useState({
    name: '', wine_type: 'red', description: '', vintage_year: '', price: '', stock_quantity: '', image_url: ''
  })
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')

  const fetchWines = async () => {
    try {
      const response = await api.get('/api/wines')
      setWines(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchWines() }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/api/wines/${editing}`, form)
        setMessage('Wine updated!')
      } else {
        await api.post('/api/wines', form)
        setMessage('Wine created!')
      }
      setForm({ name: '', wine_type: 'red', description: '', vintage_year: '', price: '', stock_quantity: '', image_url: '' })
      setEditing(null)
      fetchWines()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setMessage('Failed to save wine')
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
          <input type="number" name="vintage_year" value={form.vintage_year} onChange={handleChange} />
        </div>
        <div>
          <label>Price:</label>
          <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required />
        </div>
        <div>
          <label>Stock:</label>
          <input type="number" name="stock_quantity" value={form.stock_quantity} onChange={handleChange} required />
        </div>
        <div>
          <label>Image URL:</label>
          <input type="text" name="image_url" value={form.image_url} onChange={handleChange} />
        </div>
        <button type="submit">{editing ? 'Update Wine' : 'Add Wine'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', wine_type: 'red', description: '', vintage_year: '', price: '', stock_quantity: '', image_url: '' }) }}>Cancel</button>}
      </form>

      <table>
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
          {wines.map((wine) => (
            <tr key={wine.wineID} style={{ opacity: wine.is_active ? 1 : 0.5 }}>
              <td>{wine.name}</td>
              <td>{wine.wine_type}</td>
              <td>{wine.vintage_year}</td>
              <td>${wine.price}</td>
              <td>{wine.stock_quantity}</td>
              <td>{wine.is_active ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn-small" onClick={() => handleEdit(wine)}>Edit</button>
                <button className="btn-small" onClick={() => handleToggleActive(wine)}>
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