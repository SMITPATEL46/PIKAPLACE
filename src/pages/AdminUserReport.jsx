import { useMemo } from 'react'
import Navbar from '../components/Navbar.jsx'
import './AdminDashboard.css'

const userSummary = {
  total: 1280,
  newThisMonth: 145,
  purchasers: 860,
  returningRate: 62,
}

const monthlyUsers = [
  { month: 'Jan', users: 80 },
  { month: 'Feb', users: 95 },
  { month: 'Mar', users: 110 },
  { month: 'Apr', users: 130 },
  { month: 'May', users: 145 },
  { month: 'Jun', users: 160 },
]

function AdminUserReport() {
  const maxUsers = useMemo(
    () => Math.max(...monthlyUsers.map((m) => m.users)),
    [],
  )

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <section className="admin-inner">
          <header className="admin-header">
            <div>
              <h1 className="admin-title">User growth report</h1>
              <p className="admin-subtitle">
                High‑level view of how many users are registering and purchasing over time.
              </p>
            </div>
          </header>

          <section className="admin-section">
            <div className="admin-grid">
              <div className="admin-card admin-card--summary">
                <h3 className="admin-card-title">User snapshot</h3>
                <div className="admin-kpi-grid">
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">Total users</span>
                    <span className="admin-kpi-value">{userSummary.total}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">New this month</span>
                    <span className="admin-kpi-value">{userSummary.newThisMonth}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">Have purchased</span>
                    <span className="admin-kpi-value">{userSummary.purchasers}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">Returning rate</span>
                    <span className="admin-kpi-value">{userSummary.returningRate}%</span>
                  </div>
                </div>
              </div>

              <div className="admin-card admin-card--chart">
                <h3 className="admin-card-title">New users by month</h3>
                <div className="admin-circle-grid">
                  {monthlyUsers.map((m) => {
                    const ratio = m.users / maxUsers
                    const angle = ratio * 360
                    const percent = Math.round(ratio * 100)
                    return (
                      <div key={m.month} className="admin-circle-card">
                        <div
                          className="admin-circle admin-circle--blue"
                          style={{ '--angle': `${angle}deg` }}
                        >
                          <div className="admin-circle-inner">
                            <span className="admin-circle-value">{m.users}</span>
                            <span className="admin-circle-label">Users</span>
                          </div>
                        </div>
                        <div className="admin-circle-caption">
                          <span className="admin-circle-title">{m.month}</span>
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

export default AdminUserReport

