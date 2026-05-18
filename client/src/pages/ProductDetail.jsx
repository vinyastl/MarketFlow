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

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <button className="link-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="product-detail">
        <img src={product.image} alt={product.name} />
        <div>
          <h1>{product.name}</h1>
          <p className="rating">⭐ {product.rating}</p>
          <p className="price big">${product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          <p>In stock: {product.stock}</p>
          <div className="qty-row">
            <label>Qty:</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <button
            className="btn primary big"
            onClick={() => {
              addToCart(product, quantity);
              navigate("/cart");
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
