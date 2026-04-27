import { Link } from 'react-router-dom'

const AccessDenied = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h2>Access Denied 🔒</h2>
      <p>You don't have permission to access this page. Admin privileges are required.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
        Go Home
      </Link>
    </div>
  )
}

export default AccessDenied
