import { useState, useEffect } from 'react'
import api from '../api'

const AdminCustomers = () => {
  const [users, setUsers] = useState([])
  const [message, setMessage] = useState('')

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users')
      setUsers(response.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (userID) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return
    try {
      await api.delete(`/api/users/${userID}`)
      setMessage('User deactivated')
      fetchUsers()
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h2>Manage Customers</h2>
      {message && <p className="message-success">{message}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Age Verified</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userID} style={{ opacity: user.is_active ? 1 : 0.5 }}>
              <td>{user.userID}</td>
              <td>{user.FirstName} {user.LastName}</td>
              <td>{user.Email}</td>
              <td>{user.phone}</td>
              <td>{user.address}</td>
              <td>{user.is_age_verified ? 'Yes' : 'No'}</td>
              <td>{user.is_active ? 'Yes' : 'No'}</td>
              <td>
                {user.is_active && (
                  <button className="btn-small" onClick={() => handleDelete(user.userID)}>Deactivate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminCustomers