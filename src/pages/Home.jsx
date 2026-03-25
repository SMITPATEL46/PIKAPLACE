import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import './Home.css'

const categories = [
  {
    id: 'luxury',
    name: 'Luxury Watches',
    description: 'Hand-finished pieces with precious metals and sapphire glass.',
    image:
      'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/ydLC5vD0zu2exNPmIFHdn.png',
  },
  {
    id: 'sports',
    name: 'Sports Watches',
    description: 'Rugged chronographs built for performance and precision.',
    image:
      'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/aeqO41N8Ug7-_T3N1FM2A.png',
  },
  {
    id: 'casual',
    name: 'Casual Watches',
    description: 'Minimal everyday designs that pair with anything.',
    image:
      'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  },
  {
    id: 'formal',
    name: 'Formal Watches',
    description: 'Slim, elegant dress watches for black-tie occasions.',
    image:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
  },
]

// const featuredProducts = [
//   {
//     id: 1,
//     name: 'Aurelius Classic Gold',
//     price: '₹5,999',
//     rating: 4.9,
//     image:
//       'https://images.unsplash.com/photo-1548171916-30c7c511c1e9?auto=format&fit=crop&w=900&q=80',
//   },
//   {
//     id: 2,
//     name: 'Noir Heritage Leather',
//     price: '₹4,999',
//     rating: 4.7,
//     image:
//       'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80',
//   },
//   {
//     id: 3,
//     name: 'Midnight Steel Chrono',
//     price: '₹5,499',
//     rating: 4.8,
//     image:
//       'https://images.unsplash.com/photo-1524592714635-79fdaec1c1c1?auto=format&fit=crop&w=900&q=80',
//   },
//   {
//     id: 4,
//     name: 'Regal Silver Date',
//     price: '₹4,499',
//     rating: 4.6,
//     image:
//       'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=900&q=80',
//   },
//   {
//     id: 5,
//     name: 'Naval Blue Classic',
//     price: '₹3,999',
//     rating: 4.5,
//     image:
//       'https://images.unsplash.com/photo-1524594154908-edd35596e0df?auto=format&fit=crop&w=900&q=80',
//   },
//   {
//     id: 6,
//     name: 'Ivory Dial Heritage',
//     price: '₹3,499',
//     rating: 4.4,
//     image:
//       'https://images.unsplash.com/photo-1541140134513-85a161dc4a00?auto=format&fit=crop&w=900&q=80',
//   },
// ]

const features = [
  {
    title: 'Premium Quality',
    description: 'Swiss movements, sapphire glass, and hand-finished cases.',
  },
  {
    title: 'Free Shipping',
    description: 'Complimentary worldwide delivery on all orders.',
  },
  {
    title: 'Easy Returns',
    description: '30-day hassle-free returns on every purchase.',
  },
  {
    title: 'Secure Payments',
    description: '256-bit encrypted checkout with all major providers.',
  },
]

const HERO_STORAGE_KEY = 'home_hero'
const HOME_SECTION_KEYS_KEY = 'home_section_keys'
const HOME_COLLECTIONS_KEY = 'home_collections'

const defaultHomeSectionKeys = ['collections', 'offer', 'features', 'testimonials']

const defaultCollections = categories.map((x) => ({
  id: x.id,
  title: x.name,
  story: x.description,
  image: x.image,
}))

const loadHeroConfig = () => {
  const fallback = {
    tag: 'New arrivals · 2026 collection',
    titleMain: 'Timeless Watches for',
    titleHighlight: 'Timeless Style',
    subtitle:
      'Premium analog watches crafted for elegance and precision. Discover hand-finished pieces that celebrate classic horology with a contemporary edge.',
    watchName: 'Midnight Steel Chrono',
    watchSub: 'Limited edition · 250 pieces',
    priceText: '₹5,999',
    imageUrl:
      'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/height:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/1-rKSrImqDhRJv01tqjmn.png@jpg',
  }

  try {
    const raw = localStorage.getItem(HERO_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}

const testimonials = [
  {
    name: 'Arjun Mehta',
    text: 'The build quality is exceptional. It feels like a timepiece I will pass down.',
    rating: 5,
  },
  {
    name: 'Sophia Rao',
    text: 'Elegant, minimal, and incredibly precise. Complements every outfit I own.',
    rating: 4,
  },
  {
    name: 'Rahul Verma',
    text: 'Customer service was outstanding and the packaging felt truly premium.',
    rating: 5,
  },
]

const loadHomeSectionKeys = () => {
  try {
    const raw = localStorage.getItem(HOME_SECTION_KEYS_KEY)
    if (!raw) return defaultHomeSectionKeys
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultHomeSectionKeys
    return parsed
  } catch {
    return defaultHomeSectionKeys
  }
}

const loadCollections = () => {
  try {
    const raw = localStorage.getItem(HOME_COLLECTIONS_KEY)
    if (!raw) return defaultCollections
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultCollections
    return parsed
  } catch {
    return defaultCollections
  }
}

function StarRating({ value }) {
  const fullStars = Math.floor(value)
  const halfStar = value - fullStars >= 0.5
  const total = 5

  return (
    <div className="flex items-center gap-0.5 text-xs text-amber-400">
      {Array.from({ length: total }).map((_, index) => {
        if (index < fullStars) {
          return <span key={index}>★</span>
        }
        if (index === fullStars && halfStar) {
          return <span key={index}>☆</span>
        }
        return (
          <span key={index} className="text-slate-500">
            ★
          </span>
        )
      })}
    </div>
  )
}

function Home() {
  const hero = loadHeroConfig()
  const homeSections = loadHomeSectionKeys()
  const collections = loadCollections()

  return (
    <>
      <Navbar />
      <main className="home">
      {/* Hero Section */}
      <section className="relative overflow-hidden home-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/20 via-slate-100/5 to-sky-400/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 md:flex-row md:items-center md:py-24 lg:px-6 home-inner home-hero-grid">
          <div className="max-w-xl space-y-6 hero-left">
            <p className="inline-flex items-center rounded-full border border-amber-400/40 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 hero-badge">
              {hero.tag}
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl hero-title">
              {hero.titleMain}{' '}
              <span className="bg-gradient-to-r from-amber-300 via-slate-100 to-sky-300 bg-clip-text text-transparent hero-highlight">
                {hero.titleHighlight}
              </span>
            </h1>
            <p className="max-w-lg text-sm text-slate-300 sm:text-base hero-subtitle">
              {hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 hero-ctas">
              <Link
                to="/product"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition hover:bg-amber-300 btn-primary"
              >
                Shop Now
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-xs text-slate-400 sm:text-sm hero-meta">
              <div>
                <p className="font-semibold text-slate-100 hero-meta-title">24-Month Warranty</p>
                <p>On all mechanical movements</p>
              </div>
              <div>
                <p className="font-semibold text-slate-100 hero-meta-title">Authenticity Certificate</p>
                <p>Included with every watch</p>
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-sm flex-col items-center gap-6 hero-right">
            <div className="hero-watch-shell">
              <div className="hero-watch-ring-outer" />
              <img
                  src={hero.imageUrl}
                  alt={hero.watchName || 'Featured classic watch'}
                  className="hero-watch-image"
                />
            </div>
            <div className="flex w-full items-center justify-between rounded-2xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-xs text-slate-300 hero-watch-meta">
              <div>
                <p className="font-semibold text-slate-100">{hero.watchName}</p>
                <p className="text-[0.7rem] text-slate-400">{hero.watchSub}</p>
              </div>
              <p className="font-semibold text-amber-300 hero-watch-price">{hero.priceText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories / Collections */}
      {homeSections.includes('collections') ? (
        <section className="mx-auto max-w-6xl px-4 py-12 lg:px-6 home-inner">
          <div className="mb-6 flex items-end justify-between gap-3 section-header">
            <div>
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl section-title">
                Collections
              </h2>
              <p className="text-sm text-slate-400 section-subtitle">
                Explore our curated collections designed for every occasion.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 card-grid card-grid--categories">
            {collections.map((category) => (
              <article
                key={category.id}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm shadow-black/40 transition hover:-translate-y-1 hover:border-amber-300/70 hover:shadow-xl hover:shadow-black/60 category-card"
              >
                <div className="relative h-40 overflow-hidden category-image">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-110"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent category-gradient" />
                </div>
                <div className="space-y-1 p-4 category-content">
                  <h3 className="text-sm font-semibold text-slate-50 category-name">
                    {category.title}
                  </h3>
                  <p className="text-xs text-slate-400 category-desc">{category.story}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Featured Products
      <section className="bg-slate-950/80 py-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 home-inner">
          <div className="mb-6 flex items-end justify-between gap-3 section-header">
            <div>
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl section-title">
                Featured Watches
              </h2>
              <p className="text-sm text-slate-400 section-subtitle">
                Handpicked classics that define the PIKAPLACE experience.
              </p>
            </div>
            <Link to="/product" className="hidden text-xs font-semibold text-amber-300 hover:text-amber-200 sm:inline link-ghost">
              View all products →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 card-grid card-grid--products">
            {featuredProducts.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm shadow-black/40 transition hover:-translate-y-1 hover:border-amber-300/70 hover:shadow-xl hover:shadow-black/70 product-card"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900 product-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110 group-hover:brightness-110"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-900/80 text-xs text-slate-200 hover:border-amber-300 hover:text-amber-300 wishlist-btn"
                    aria-label="Add to wishlist"
                  >
                    ♥
                  </button>
                </div>
                <div className="flex flex-1 flex-col justify-between p-4 product-content">
                  <div className="space-y-1 ">
                    <h3 className="text-sm font-semibold text-slate-50 product-name">
                      {product.name}
                    </h3>
                    <StarRating value={product.rating} />
                  </div>
                  <div className="mt-4 flex items-center justify-between product-footer">
                    <p className="text-sm font-semibold text-amber-300 product-price">
                      {product.price}
                    </p>
                    <button
                      type="button"
                      className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950 btn-cart"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section> */}

      {/* Offer Banner */}
      {homeSections.includes('offer') ? (
        <section className="offer-section">
          <div className="offer-card">
            <p className="offer-kicker">Limited Time Offer</p>
            <h2 className="offer-title">
              Exclusive Deals – Up to <span>40% OFF</span> on Premium Watches
            </h2>
            <p className="offer-text">
              Upgrade your collection with handpicked classics, available for a limited time at
              exclusive prices. Once they&apos;re gone, they&apos;re gone.
            </p>
            <Link to="/product" className="btn-primary">
              Shop Offers
            </Link>
          </div>
        </section>
      ) : null}

      {/* Why Choose Us */}
      {homeSections.includes('features') ? (
        <section className="features-section">
          <div className="mx-auto max-w-6xl px-4 lg:px-6 home-inner">
            <div className="mb-6 text-center features-header">
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl features-title">
                Why Choose PIKAPLACE
              </h2>
              <p className="mt-1 text-sm text-slate-400 features-subtitle">
                Every watch is curated to meet the highest standards of craftsmanship.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 card-grid card-grid--features">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-center shadow-sm shadow-black/40 feature-card"
                >
                  <h3 className="text-sm font-semibold text-slate-50 feature-title">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-400 feature-text">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {homeSections.includes('testimonials') ? (
        <section className="testimonials-section">
          <div className="mx-auto max-w-6xl px-4 lg:px-6 home-inner">
            <div className="mb-6 text-center features-header">
              <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl features-title">
                What Clients Say
              </h2>
              <p className="mt-1 text-sm text-slate-400 features-subtitle">
                Stories from collectors who chose to invest in timeless design.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3 card-grid card-grid--testimonials">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300 shadow-sm shadow-black/40 testimonial-card"
                >
                  <p className="mb-3 text-xs text-amber-300 testimonial-stars">
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <span key={index}>★</span>
                    ))}
                  </p>
                  <p className="mb-4 text-xs sm:text-sm testimonial-text">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="text-xs font-semibold text-slate-100 testimonial-name">
                    {testimonial.name}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Newsletter */}
      {/* <section className="newsletter-section">
        <div className="newsletter-inner">
          <h2 className="newsletter-title">Stay Ahead of Every Release</h2>
          <p className="newsletter-text">
            Be the first to know about limited drops, private sales, and horology insights.
          </p>
          <form className="newsletter-form">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
          <p className="newsletter-note">
            We respect your inbox. No spam, only curated watch stories.
          </p>
        </div>
      </section> */}

      {/* Footer (basic, no nav links) */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <p>© {new Date().getFullYear()} PIKAPLACE. All rights reserved.</p>
          <div className="footer-socials">
            <button type="button" aria-label="Instagram" className="footer-icon-btn">
              IG
            </button>
            <button type="button" aria-label="Twitter" className="footer-icon-btn">
              X
            </button>
            <button type="button" aria-label="YouTube" className="footer-icon-btn">
              ▶
            </button>
          </div>
        </div>
      </footer>
    </main>
    </>
  )
}

export default Home

