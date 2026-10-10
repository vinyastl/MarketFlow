import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err.response?.data?.error || "Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <button className="link-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  const atStockLimit = quantity >= product.stock;

  return (
    <div className="container">
      <button className="link-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="product-detail">
        <img src={product.image || "https://via.placeholder.com/400x400?text=No+Image"} alt={product.name} />
        <div>
          <h1>{product.name}</h1>
          <p className="category-label">{product.category}</p>
          <p className="rating">⭐ {product.rating}</p>
          <p className="price big">${Number(product.price).toFixed(2)}</p>
          <p>{product.description}</p>
          <p>In stock: {product.stock}</p>
          <div className="qty-row">
            <label htmlFor="qty">Qty:</label>
            <input
              id="qty"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))
              }
            />
          </div>
          <button
            className="btn primary big"
            disabled={atStockLimit}
            onClick={() => {
              addToCart(product, quantity);
              navigate("/cart");
            }}
          >
            {atStockLimit ? "No more in stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}