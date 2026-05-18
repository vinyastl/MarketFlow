import { useEffect, useState } from "react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: category ? { category } : {} })
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  const categories = ["", "electronics", "clothing", "home", "accessories", "footwear", "fitness"];

  return (
    <div className="container">
      <h1>Shop our collection</h1>

      <div className="filters">
        {categories.map((c) => (
          <button
            key={c || "all"}
            onClick={() => setCategory(c)}
            className={`chip ${category === c ? "active" : ""}`}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
