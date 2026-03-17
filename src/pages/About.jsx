import Navbar from '../components/Navbar.jsx'
import './About.css'

const aboutImages = [
  {
    id: 'hero',
    url: 'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/height:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/1-rKSrImqDhRJv01tqjmn.png@jpg',
  },
  {
    id: 'luxury',
    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'craft',
    url: 'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  },
  {
    id: 'casual',
    url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
  },
]

function About() {
  return (
    <>
      <Navbar />
      <main className="about-page">
        <section className="about-hero">
          <div className="about-hero-content">
            <p className="about-pill">About PIKAPLACE</p>
            <h1 className="about-title">
              Timeless watches, crafted
              <span> for every moment.</span>
            </h1>
            <p className="about-subtitle">
              At PIKAPLACE, we blend classic watchmaking heritage with modern
              design. Every piece is curated to feel special on your wrist –
              whether it&apos;s your first interview, a weekend escape, or a
              once-in-a-lifetime celebration.
            </p>
            <div className="about-stats">
              <div className="about-stat">
                <span className="about-stat-number">50+</span>
                <span className="about-stat-label">Curated designs</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-number">4.8★</span>
                <span className="about-stat-label">Average rating</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-number">24/7</span>
                <span className="about-stat-label">Support</span>
              </div>
            </div>
          </div>
          <div className="about-hero-media">
            <div className="about-hero-img-wrap">
              <img
                src={aboutImages[0].url}
                alt="PIKAPLACE featured timepiece"
                className="about-hero-img"
              />
            </div>
            <div className="about-hero-cards">
              <div className="about-hero-card primary">
                <div className="about-hero-card-bg">
                  <img src={aboutImages[1].url} alt="" aria-hidden />
                </div>
                <div className="about-hero-card-content">
                  <p className="about-hero-tag">Signature Collection</p>
                  <p className="about-hero-text">
                    Minimal dials, rich textures, and premium finishes built to
                    outlast trends.
                  </p>
                </div>
              </div>
              <div className="about-hero-card secondary">
                <div className="about-hero-card-bg">
                  <img src={aboutImages[2].url} alt="" aria-hidden />
                </div>
                <div className="about-hero-card-content">
                  <p className="about-hero-tag">Crafted for India</p>
                  <p className="about-hero-text">
                    Comfort-focused straps, durable cases, and water resistance
                    for everyday life.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-grid">
          <article className="about-block about-block--img">
            <div className="about-block-image">
              <img src={aboutImages[3].url} alt="Our heritage" />
            </div>
            <div className="about-block-body">
              <h2>Our story</h2>
              <p>
              PIKAPLACE started with a simple idea: great watches shouldn&apos;t
              feel out of reach. We were tired of choosing between unreliable
              budget pieces and overpriced luxury. So we set out to build a
              curated collection that delivers both character and quality.
            </p>
            <p>
            Today, we partner with trusted manufacturers and designers to
            bring you watches that balance precision engineering with
            timeless aesthetics.
              </p>
            </div>
          </article>

          <article className="about-block about-block--img">
            <div className="about-block-image">
              <img src={aboutImages[2].url} alt="Craft and quality" />
            </div>
            <div className="about-block-body">
              <h2>Craft &amp; quality</h2>
            <ul className="about-list">
              <li>Stainless steel or premium alloy cases for lasting durability.</li>
              <li>Comfort-first straps: leather, steel, and sport-ready bands.</li>
              <li>Thoughtful details like sapphire / mineral glass and date windows.</li>
              <li>Curated collections for classic, casual, dress, and sport styles.</li>
            </ul>
            </div>
          </article>

          <article className="about-block">
            <h2>Our promise</h2>
            <p>
              We keep our experience simple: transparent pricing, clear
              information, and responsive support. If something doesn&apos;t
              feel right with your order, our team is ready to help you make it
              right.
            </p>
          </article>

          <article className="about-block">
            <h2>Need help?</h2>
            <p>
              Have a question about sizing, straps, or picking the right watch
              for a special occasion? Reach out to us:
            </p>
            <ul className="about-contact">
              <li>Email: <span>support@pikaplace.in</span></li>
              <li>Phone / WhatsApp: <span>+91-98765-43210</span></li>
              <li>Support hours: <span>Mon – Sat, 10am to 7pm IST</span></li>
            </ul>
          </article>
        </section>
      </main>
    </>
  )
}

export default About
