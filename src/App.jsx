import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import About from './pages/About'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import AdminRoute from './components/AdminRoute'
import LogoPreview from './pages/LogoPreview'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Contact from './pages/Contact'
import RefundPolicy from './pages/RefundPolicy'
import PaymentCallback from './pages/PaymentCallback'
import ShippingPolicy from './pages/ShippingPolicy'
import TermsConditions from './pages/TermsConditions'
import TrackOrder from './pages/TrackOrder'
import FAQ from './pages/FAQ'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <CartDrawer />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
                <Route path="/logo-preview" element={<LogoPreview />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsConditions />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/faq" element={<FAQ />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
