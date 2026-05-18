import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
          alt={product.name}
        />
        <h3>{product.name}</h3>
      </Link>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="rating">⭐ {product.rating}</p>
      <button onClick={() => addToCart(product)} className="btn primary">
        Add to cart
      </button>
    </div>
  );
}
