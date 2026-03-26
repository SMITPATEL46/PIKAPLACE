import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { apiFetch } from '../api/apiClient.js'
import './AdminDashboard.css'

function AdminProductReport() {
  const [report, setReport] = useState({
    salesSummary: { today: 0, month: 0, year: 0, allTime: 0 },
    productSales: [],
  })

  useEffect(() => {
    apiFetch('/api/admin/reports/products')
      .then((data) => {
        if (data?.salesSummary && Array.isArray(data?.productSales)) {
          setReport(data)
        }
      })
      .catch(() => {})
  }, [])

  const maxSold = useMemo(
    () => Math.max(...(report.productSales || []).map((p) => p?.sold || 0), 0),
    [report.productSales],
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
                    <span className="admin-kpi-value">{report.salesSummary.today}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">This month</span>
                    <span className="admin-kpi-value">{report.salesSummary.month}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">This year</span>
                    <span className="admin-kpi-value">{report.salesSummary.year}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">All time</span>
                    <span className="admin-kpi-value">{report.salesSummary.allTime}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card admin-card--chart">
                <h3 className="admin-card-title">Top selling products</h3>
                <div className="admin-circle-grid">
                  {(report.productSales || []).map((p) => {
                    const ratio = maxSold ? (p?.sold || 0) / maxSold : 0
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

