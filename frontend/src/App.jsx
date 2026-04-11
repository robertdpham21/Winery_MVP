import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setLoaded(true))
  }, [])

  return (
    <div className={`splash ${loaded ? 'loaded' : ''}`}>
      <div className="grain" />
      <div className="vignette" />

      <nav className="top-bar">
        <span className="nav-item">Est. 2026</span>
        <span className="nav-item">Coming Soon</span>
      </nav>

      <main className="hero">
        <div className="logo-placeholder">
          <div className="logo-ring">
            <span>T&P</span>
          </div>
        </div>

        <h1 className="title">
          <span className="title-line">Tam <em>&</em> Pham's</span>
          <span className="title-line title-large">Winery</span>
        </h1>

        <div className="divider">
          <span className="divider-diamond" />
        </div>

        <p className="tagline">
          Premium selection of Texas Hill Country Wines available soon for online orders <br />
          Doors open on April 27th. 
        </p>

        <form
          className="notify-form"
          onSubmit={(e) => {
            e.preventDefault()
            alert('Thank you! We\'ll be in touch.')
          }}
        >
          <input
            type="email"
            placeholder="Your email for updates"
            required
            className="email-input"
          />
          <button type="submit" className="notify-btn">Notify Me</button>
        </form>
      </main>

      <footer className="bottom-bar">
        <span>Tam & Pham's Winery</span>
        <span className="footer-dot">·</span>
        <span>Fine wines, arriving soon</span>
      </footer>
    </div>
  )
}

export default App