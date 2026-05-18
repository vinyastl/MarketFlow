import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/checkout"
          element={
            <Protected>
              <Checkout />
            </Protected>
          }
        />
        <Route
          path="/orders"
          element={
            <Protected>
              <Orders />
            </Protected>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <Protected>
              <OrderDetail />
            </Protected>
          }
        />
      </Routes>
    </>
  );
}
