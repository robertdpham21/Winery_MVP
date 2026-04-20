import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@asgardeo/react'
import api from '../api'

const CompleteProfile = ({ onComplete }) => {
  const navigate = useNavigate()
  const user = useUser()
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    date_of_birth: '',
    phone: '',
    address: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('/api/users/complete-profile', {
        FirstName: formData.FirstName,
        LastName: formData.LastName,
        Email: user?.flattenedProfile?.username || user?.email || '',
        date_of_birth: formData.date_of_birth,
        phone: formData.phone,
        address: formData.address,
      })
      if (response.status === 201) {
        if (onComplete) onComplete()
        navigate('/wines')
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('You must be 21 or older to register.')
      } else if (err.response && err.response.status === 400) {
        setError('Profile already exists.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <p>Please fill in your details to continue.</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input type="text" name="FirstName" value={formData.FirstName} onChange={handleChange} required />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" name="LastName" value={formData.LastName} onChange={handleChange} required />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
        </div>
        <div>
          <label>Phone:</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} pattern="[0-9\-\(\)\s\+]{7,15}" title="Please enter a valid phone number" required />
        </div>
        <div>
          <label>Address:</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} minLength="10" title="Please enter a full address" required />
        </div>
        <button type="submit">Verify Age & Complete Profile</button>
      </form>
    </div>
  )
}

export default CompleteProfile