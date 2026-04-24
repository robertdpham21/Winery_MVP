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

  return (
    <div>
      <h2>View Customers</h2>
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
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userID}>
              <td>{user.userID}</td>
              <td>{user.FirstName} {user.LastName}</td>
              <td>{user.Email}</td>
              <td>{user.phone}</td>
              <td>{user.address}</td>
              <td>{user.is_age_verified ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminCustomers