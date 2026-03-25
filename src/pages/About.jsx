import Navbar from '../components/Navbar.jsx'
import './About.css'

const ABOUT_STORAGE_KEY = 'about_content'
const ABOUT_BLOGS_KEY = 'about_blogs'

const defaultAbout = {
  heroPill: 'About PIKAPLACE',
  heroTitleMain: 'Timeless watches, crafted',
  heroTitleHighlight: ' for every moment.',
  heroSubtitle:
    "At PIKAPLACE, we blend classic watchmaking heritage with modern design. Every piece is curated to feel special on your wrist – whether it's your first interview, a weekend escape, or a once-in-a-lifetime celebration.",
  stat1Number: '50+',
  stat1Label: 'Curated designs',
  stat2Number: '4.8★',
  stat2Label: 'Average rating',
  stat3Number: '24/7',
  stat3Label: 'Support',
  heroMainImage:
    'https://imgproxy.gamma.app/resize/quality:80/resizing_type:fit/width:500/height:500/https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/1-rKSrImqDhRJv01tqjmn.png@jpg',
  heroCard1Image:
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  heroCard2Image:
    'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  heroCard1Tag: 'Signature Collection',
  heroCard1Text:
    'Minimal dials, rich textures, and premium finishes built to outlast trends.',
  heroCard2Tag: 'Crafted for India',
  heroCard2Text:
    'Comfort-focused straps, durable cases, and water resistance for everyday life.',
  storyImage:
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
  storyTitle: 'Our story',
  storyBody1:
    "PIKAPLACE started with a simple idea: great watches shouldn't feel out of reach. We were tired of choosing between unreliable budget pieces and overpriced luxury. So we set out to build a curated collection that delivers both character and quality.",
  storyBody2:
    'Today, we partner with trusted manufacturers and designers to bring you watches that balance precision engineering with timeless aesthetics.',
  craftImage:
    'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  craftTitle: 'Craft & quality',
  craftList:
    'Stainless steel or premium alloy cases for lasting durability.\nComfort-first straps: leather, steel, and sport-ready bands.\nThoughtful details like sapphire / mineral glass and date windows.\nCurated collections for classic, casual, dress, and sport styles.',
  promiseTitle: 'Our promise',
  promiseText:
    "We keep our experience simple: transparent pricing, clear information, and responsive support. If something doesn't feel right with your order, our team is ready to help you make it right.",
  helpTitle: 'Need help?',
  helpIntro:
    'Have a question about sizing, straps, or picking the right watch for a special occasion? Reach out to us:',
  helpEmail: 'support@pikaplace.in',
  helpPhone: '+91-98765-43210',
  helpHours: 'Mon – Sat, 10am to 7pm IST',
}

const loadAboutConfig = () => {
  try {
    const raw = localStorage.getItem(ABOUT_STORAGE_KEY)
    if (!raw) return defaultAbout
    const parsed = JSON.parse(raw)
    return { ...defaultAbout, ...parsed }
  } catch {
    return defaultAbout
  }
}

const defaultAboutBlogs = [
  {
    id: 'story',
    title: 'Our story',
    story:
      "PIKAPLACE started with a simple idea: great watches shouldn't feel out of reach. We were tired of choosing between unreliable budget pieces and overpriced luxury. So we set out to build a curated collection that delivers both character and quality. Today, we partner with trusted manufacturers and designers to bring you watches that balance precision engineering with timeless aesthetics.",
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'craft',
    title: 'Craft & quality',
    story:
      'Stainless steel or premium alloy cases for lasting durability. Comfort-first straps: leather, steel, and sport-ready bands. Thoughtful details like sapphire/mineral glass and date windows. Curated collections for classic, casual, dress, and sport styles.',
    image: 'https://cdn.gamma.app/5ofxzhzh7h3wl0r/generated-images/kpiokBniZGz2LscKaJdA-.png',
  },
  {
    id: 'promise',
    title: 'Our promise',
    story:
      "We keep our experience simple: transparent pricing, clear information, and responsive support. If something doesn't feel right with your order, our team is ready to help you make it right.",
    image: '',
  },
  {
    id: 'help',
    title: 'Need help?',
    story: 'Email: support@pikaplace.in | Phone/WhatsApp: +91-98765-43210 | Hours: Mon-Sat, 10am-7pm IST',
    image: '',
  },
]

const loadAboutBlogs = () => {
  try {
    const raw = localStorage.getItem(ABOUT_BLOGS_KEY)
    if (!raw) return defaultAboutBlogs
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultAboutBlogs
    return parsed
  } catch {
    return defaultAboutBlogs
  }
}

function About() {
  const about = loadAboutConfig()
  const aboutBlogs = loadAboutBlogs()
  const aboutImages = [
    { id: 'hero', url: about.heroMainImage },
    { id: 'luxury', url: about.heroCard1Image },
    { id: 'craft', url: about.heroCard2Image },
    { id: 'casual', url: about.storyImage },
  ]
  return (
    <>
      <Navbar />
      <main className="about-page">
        <section className="about-hero">
          <div className="about-hero-content">
            <p className="about-pill">{about.heroPill}</p>
            <h1 className="about-title">
              {about.heroTitleMain}
              <span>{about.heroTitleHighlight}</span>
            </h1>
            <p className="about-subtitle">
              {about.heroSubtitle}
            </p>
            <div className="about-stats">
              <div className="about-stat">
                <span className="about-stat-number">{about.stat1Number}</span>
                <span className="about-stat-label">{about.stat1Label}</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-number">{about.stat2Number}</span>
                <span className="about-stat-label">{about.stat2Label}</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-number">{about.stat3Number}</span>
                <span className="about-stat-label">{about.stat3Label}</span>
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
                  <p className="about-hero-tag">{about.heroCard1Tag}</p>
                  <p className="about-hero-text">{about.heroCard1Text}</p>
                </div>
              </div>
              <div className="about-hero-card secondary">
                <div className="about-hero-card-bg">
                  <img src={aboutImages[2].url} alt="" aria-hidden />
                </div>
                <div className="about-hero-card-content">
                  <p className="about-hero-tag">{about.heroCard2Tag}</p>
                  <p className="about-hero-text">{about.heroCard2Text}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-grid">
          {aboutBlogs.map((blog) => (
            <article
              key={blog.id}
              className={`about-block ${blog.image ? 'about-block--img' : ''}`.trim()}
            >
              {blog.image ? (
                <div className="about-block-image">
                  <img src={blog.image} alt={blog.title || 'About blog'} />
                </div>
              ) : null}
              <div className="about-block-body">
                <h2>{blog.title}</h2>
                <p>{blog.story}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}

export default About
