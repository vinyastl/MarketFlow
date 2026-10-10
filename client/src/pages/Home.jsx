import { useEffect, useState } from "react";
import api from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

const CATEGORIES = ["", "electronics", "clothing", "home", "accessories", "footwear", "fitness"];

const SORT_OPTIONS = [
  { value: "", label: "Sort: featured" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating_desc", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      api
        .get("/products", { params: { category, q: query.trim(), sort } })
        .then((res) => setProducts(res.data))
        .catch(() =>
          setError("Could not load products. Make sure the backend server is running.")
        )
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, category, sort]);

  return (
    <div className="container">
      <h1>Shop our collection</h1>

      <div className="toolbar">
        <input
          type="search"
          className="search-box"
          placeholder="Search products..."
          aria-label="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="sort-select"
          aria-label="Sort products"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filters">
        {CATEGORIES.map((c) => (
          <button
            key={c || "all"}
            onClick={() => setCategory(c)}
            className={`chip ${category === c ? "active" : ""}`}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      {loading && <p aria-live="polite">Loading products...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="empty-state">
          No products match your search. Try a different keyword or category.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <p className="result-count">{products.length} product(s)</p>
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}