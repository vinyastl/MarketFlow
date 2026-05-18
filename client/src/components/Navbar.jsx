import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        ShopMERN
      </Link>
      <div className="nav-links">
        <Link to="/">Products</Link>
        <Link to="/cart">
          Cart {count > 0 && <span className="badge">{count}</span>}
        </Link>
        {user ? (
          <>
            <Link to="/orders">Orders</Link>
            <span className="greeting">Hi, {user.name.split(" ")[0]}</span>
            <button
              className="link-btn"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
