<<<<<<< Updated upstream
import { useMemo, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { getAllUsers, getCurrentUser, getLoginEvents, getOrders, setAllUsers } from '../utils/session.js'
import './AdminDashboard.css'

function AdminUserReport() {
  const [users, setUsers] = useState(() => getAllUsers())
  const [loginEvents, setLoginEvents] = useState(() => getLoginEvents())
  const currentUser = getCurrentUser()

  const userRows = useMemo(() => {
    const latestLoginByEmail = {}
    loginEvents.forEach((event) => {
      const email = String(event?.email || '').toLowerCase()
      if (!email) return
      if (!latestLoginByEmail[email]) latestLoginByEmail[email] = event.at
    })

    return users.map((user, index) => {
      const email = String(user?.email || '').toLowerCase()
      const orders = getOrders(email)
      return {
        id: `${email}_${index}`,
        name: user?.name || email.split('@')[0] || 'User',
        email,
        mobile: user?.mobile || '-',
        role: user?.role || 'customer',
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        lastLogin: latestLoginByEmail[email] || null,
      }
    })
  }, [users, loginEvents])

  const metrics = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const monthUserSet = new Set()
    const yearUserSet = new Set()
    const activeUserSet = new Set()

    loginEvents.forEach((event) => {
      const email = String(event?.email || '').toLowerCase()
      if (!email) return
      const date = new Date(event.at)
      if (Number.isNaN(date.getTime())) return

      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        monthUserSet.add(email)
      }
      if (date.getFullYear() === currentYear) {
        yearUserSet.add(email)
      }
      const ageMs = now.getTime() - date.getTime()
      if (ageMs <= 30 * 24 * 60 * 60 * 1000) {
        activeUserSet.add(email)
      }
    })

    return {
      totalUsers: users.length,
      activeUsers: activeUserSet.size,
      monthlyLoggedInUsers: monthUserSet.size,
      yearlyLoggedInUsers: yearUserSet.size,
    }
  }, [users, loginEvents])

  const handleDeleteUser = (email) => {
    const normalized = String(email || '').toLowerCase()
    if (!normalized) return
    if (currentUser?.email && String(currentUser.email).toLowerCase() === normalized) {
      window.alert('You cannot delete your own logged-in admin account.')
      return
    }
    const ok = window.confirm(`Delete account for ${normalized}?`)
    if (!ok) return

    const nextUsers = users.filter((u) => String(u?.email || '').toLowerCase() !== normalized)
    setUsers(nextUsers)
    setAllUsers(nextUsers)

    const nextEvents = loginEvents.filter((e) => String(e?.email || '').toLowerCase() !== normalized)
    setLoginEvents(nextEvents)
    localStorage.setItem('pikaplace:loginEvents', JSON.stringify(nextEvents))

    localStorage.removeItem(`pikaplace:cart:${normalized}`)
    localStorage.removeItem(`pikaplace:orders:${normalized}`)
=======
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { apiFetch } from '../api/apiClient.js'
import './AdminDashboard.css'

function AdminUserReport() {
  const [users, setUsers] = useState([])
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    monthlyLoggedInUsers: 0,
    yearlyLoggedInUsers: 0,
  })

  const refresh = async () => {
    const data = await apiFetch('/api/admin/users')
    setMetrics(data?.metrics || metrics)
    setUsers(data?.users || [])
  }

  useEffect(() => {
    refresh().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDeleteUser = async (userId) => {
    if (!userId) return
    const ok = window.confirm('Delete this user?')
    if (!ok) return
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      await refresh()
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.message || 'Failed to delete user.')
    }
>>>>>>> Stashed changes
  }

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <section className="admin-inner">
          <header className="admin-header">
            <div>
              <h1 className="admin-title">User report</h1>
              <p className="admin-subtitle">
                Total users, active users, monthly/yearly logins, and all user details.
              </p>
            </div>
          </header>

          <section className="admin-section">
            <div className="admin-grid">
              <div className="admin-card admin-card--summary">
                <h3 className="admin-card-title">User metrics</h3>
                <div className="admin-kpi-grid">
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">Total users</span>
                    <span className="admin-kpi-value">{metrics.totalUsers}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">Active users (30 days)</span>
                    <span className="admin-kpi-value">{metrics.activeUsers}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">Monthly login users</span>
                    <span className="admin-kpi-value">{metrics.monthlyLoggedInUsers}</span>
                  </div>
                  <div className="admin-kpi">
                    <span className="admin-kpi-label">Yearly login users</span>
                    <span className="admin-kpi-value">{metrics.yearlyLoggedInUsers}</span>
                  </div>
                </div>
              </div>

              <div className="admin-card admin-card--table">
                <h3 className="admin-card-title">All users details</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
<<<<<<< Updated upstream
                      <th>Email</th>
=======
                      <th>Phone</th>
>>>>>>> Stashed changes
                      <th>Mobile</th>
                      <th>Role</th>
                      <th>Total Orders</th>
                      <th>Last Login</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
<<<<<<< Updated upstream
                    {userRows.length === 0 ? (
=======
                    {users.length === 0 ? (
>>>>>>> Stashed changes
                      <tr>
                        <td colSpan={7}>No users found.</td>
                      </tr>
                    ) : (
<<<<<<< Updated upstream
                      userRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.name}</td>
                          <td>{row.email}</td>
                          <td>{row.mobile}</td>
=======
                      users.map((row) => (
                        <tr key={row.id}>
                          <td>{row.name || 'User'}</td>
                          <td>{row.phoneNumber}</td>
                          <td>{row.mobile || '-'}</td>
>>>>>>> Stashed changes
                          <td>{row.role}</td>
                          <td>{row.totalOrders}</td>
                          <td>{row.lastLogin ? new Date(row.lastLogin).toLocaleString('en-IN') : '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="admin-link-button admin-link-button--danger"
<<<<<<< Updated upstream
                              onClick={() => handleDeleteUser(row.email)}
=======
                              onClick={() => handleDeleteUser(row.id)}
>>>>>>> Stashed changes
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  )
}

export default AdminUserReport

