import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <p className="home-kicker">Hill Country Crafted</p>
        <h2>Welcome to Tam & Pham's Winery</h2>
        <p>
          Discover small-batch bottles, sunset tasting experiences, and the story
          behind every vintage.
        </p>
        <Link className="btn btn-primary home-cta" to="/wines">
          Explore Our Wines
        </Link>
      </section>

      <section className="home-gallery" aria-label="Featured winery scenes">
        <article className="home-card">
          <img
            src="https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?auto=format&fit=crop&w=1200&q=80"
            alt="Rows of grapevines in a vineyard"
            loading="lazy"
          />
          <div className="home-card-content">
            <h3>Vineyards</h3>
            <p>Estate-grown grapes nurtured in Texas sun and limestone soil.</p>
          </div>
        </article>

        <article className="home-card">
          <img
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80"
            alt="Wine glasses and bottles on a tasting table"
            loading="lazy"
          />
          <div className="home-card-content">
            <h3>Wines</h3>
            <p>Balanced reds, crisp whites, and sparkling pours for every palate.</p>
          </div>
        </article>

        <article className="home-card">
          <img
            src="https://images.unsplash.com/photo-1547595628-c61a29f496f0?auto=format&fit=crop&w=1200&q=80"
            alt="Modern winery building at golden hour"
            loading="lazy"
          />
          <div className="home-card-content">
            <h3>Winery</h3>
            <p>From barrel to bottle, every step is built around quality and care.</p>
          </div>
        </article>
      </section>
    </div>
  )
}

export default Home