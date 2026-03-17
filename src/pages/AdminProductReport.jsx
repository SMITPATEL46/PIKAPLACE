import { useMemo } from 'react'
import Navbar from '../components/Navbar.jsx'
import './AdminDashboard.css'

const salesSummary = {
  today: 12,
  month: 184,
  year: 1625,
  allTime: 4320,
}

const productSales = [
  { name: 'Aurelius Classic Gold', sold: 920 },
  { name: 'Midnight Steel Chrono', sold: 780 },
  { name: 'Noir Heritage Leather', sold: 650 },
  { name: 'Ivory Dial Heritage', sold: 430 },
]

function AdminProductReport() {
  const maxSold = useMemo(
    () => Math.max(...productSales.map((p) => p.sold)),
    [],
  )

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <section className="admin-inner">
          <header className="admin-header">
            <div>
              <h1 className="admin-title">Product performance report</h1>
              <p className="admin-subtitle">
                Overview of sales across different time periods and best‑selling products.
              </p>
            </div>
          </header>

          <section className="admin-section">
            <div className="admin-grid">
              <div className="admin-card admin-card--summary">
                <h3 className="admin-card-title">Sales overview</h3>
                <div className="admin-kpi-grid">
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">Today</span>
                    <span className="admin-kpi-value">{salesSummary.today}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">This month</span>
                    <span className="admin-kpi-value">{salesSummary.month}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">This year</span>
                    <span className="admin-kpi-value">{salesSummary.year}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">All time</span>
                    <span className="admin-kpi-value">{salesSummary.allTime}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card admin-card--chart">
                <h3 className="admin-card-title">Top selling products</h3>
                <div className="admin-circle-grid">
                  {productSales.map((p) => {
                    const ratio = p.sold / maxSold
                    const angle = ratio * 360
                    const percent = Math.round(ratio * 100)
                    return (
                      <div key={p.name} className="admin-circle-card">
                        <div
                          className="admin-circle admin-circle--green"
                          style={{ '--angle': `${angle}deg` }}
                        >
                          <div className="admin-circle-inner">
                            <span className="admin-circle-value">{p.sold}</span>
                            <span className="admin-circle-label">Sold</span>
                          </div>
                        </div>
                        <div className="admin-circle-caption">
                          <span className="admin-circle-title">{p.name}</span>
                          <span className="admin-circle-percent">{percent}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  )
}

export default AdminProductReport

