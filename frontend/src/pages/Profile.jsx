import { useState, useEffect } from 'react'
import api from '../api'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    phone: '',
    address: '',
  })
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/me')
        setProfile(response.data)
        setForm({
          FirstName: response.data.FirstName || '',
          LastName: response.data.LastName || '',
          Email: response.data.Email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
        })
      } catch (err) {
        console.error(err)
        setError('Failed to load profile.')
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await api.put('/api/users/me', form)
      setProfile(response.data)
      setEditing(false)
      setMessage('Profile updated!')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError('Failed to update profile.')
    }
  }

  if (!profile) return <p>Loading profile...</p>

  return (
    <div>
      <h2>Your Profile</h2>
      {message && <p className="message-success">{message}</p>}
      {error && <p className="message-error">{error}</p>}

      {!editing ? (
        <div className="card">
          <p><strong>Name:</strong> {profile.FirstName} {profile.LastName}</p>
          <p><strong>Email:</strong> {profile.Email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>Address:</strong> {profile.address}</p>
          <p><strong>Date of Birth:</strong> {profile.date_of_birth}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>First Name:</label>
            <input type="text" name="FirstName" value={form.FirstName} onChange={handleChange} required />
          </div>
          <div>
            <label>Last Name:</label>
            <input type="text" name="LastName" value={form.LastName} onChange={handleChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={form.Email} disabled />
        </div>
          <div>
            <label>Phone:</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <div>
            <label>Address:</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} required />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  )
}

export default Profile