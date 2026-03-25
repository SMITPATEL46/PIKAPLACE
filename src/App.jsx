import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Product from './pages/Product.jsx'
import Auth from './pages/Auth.jsx'
import AdminStock from './pages/AdminStock.jsx'
import AdminProductReport from './pages/AdminProductReport.jsx'
import AdminUserReport from './pages/AdminUserReport.jsx'
import AdminHome from './pages/AdminHome.jsx'
import Checkout from './pages/Checkout.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import RequireCustomer from './components/RequireCustomer.jsx'
import Profile from './pages/Profile.jsx'
import ProductDetails from './pages/ProductDetails.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/product" element={<Product />} />
      <Route path="/product/:productId" element={<ProductDetails />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route element={<RequireCustomer />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
      </Route>
      <Route path="/admin" element={<AdminStock />} />
      <Route path="/admin/stock" element={<AdminStock />} />
      <Route path="/admin/home" element={<AdminHome />} />
      <Route path="/admin/product-report" element={<AdminProductReport />} />
      <Route path="/admin/user-report" element={<AdminUserReport />} />
    </Routes>
  )
}

export default App
