import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h2>Oops, you're in the wrong place 😔😔</h2>
      <p>The page you're looking for doesn't exist or you don't have access.🚫</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
        Go Home
      </Link>
    </div>
  )
}

export default NotFound