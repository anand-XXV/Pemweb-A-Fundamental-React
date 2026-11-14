import React, { useEffect, useMemo, useState } from "react";

const INITIAL_PRODUCTS = [
  { id: 1, name: "Pulpen", price: 5000 },
  { id: 2, name: "Buku Tulis", price: 12000 },
  { id: 3, name: "Spidol", price: 8000 },
  { id: 4, name: "Penggaris", price: 6000 },
  { id: 5, name: "Penghapus", price: 3000 },
];

const STORAGE_KEY = "manajemen-produk";

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID").format(price);
}

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  }
  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m18 6-12 12M6 6l12 12" />
      </svg>
    );
  }
  if (name === "trash") {
    return (
      <svg {...common}>
        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="m16 4 4 4L9 19l-5 1 1-5L16 4Z" />
      <path d="m14 6 4 4" />
    </svg>
  );
}

function ProductDialog({ mode, product, onClose, onSave, onDelete }) {
  const isDelete = mode === "delete";
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    const numericPrice = Number(price);

    if (!cleanName) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Harga harus berupa angka lebih dari 0.");
      return;
    }

    onSave({ name: cleanName, price: numericPrice });
  }

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="dialog-title"
        aria-modal="true"
        className={`dialog ${isDelete ? "dialog-delete" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button
          aria-label="Tutup dialog"
          className="icon-button dialog-close"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" size={17} />
        </button>
        {isDelete ? (
          <>
            <div className="delete-icon">
              <Icon name="trash" size={22} />
            </div>
            <h2 id="dialog-title">Hapus Produk?</h2>
            <p className="dialog-description">
              Produk yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="delete-preview">
              <span>ID: {product.id}</span>
              <strong>{product.name}</strong>
              <b>Rp{formatPrice(product.price)}</b>
            </div>
            <div className="dialog-actions">
              <button className="button button-outline" onClick={onClose} type="button">
                Batal
              </button>
              <button className="button button-danger" onClick={onDelete} type="button">
                Hapus Produk
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="dialog-title">{mode === "add" ? "Tambah Produk" : "Edit Produk"}</h2>
            <p className="dialog-description">
              {mode === "add"
                ? "Masukkan informasi produk baru."
                : "Perbarui informasi produk yang dipilih."}
            </p>
            {mode === "edit" && <p className="product-id">ID: {product.id}</p>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="product-name">Nama Produk</label>
              <input
                autoFocus
                id="product-name"
                maxLength={60}
                onChange={(event) => setName(event.target.value)}
                placeholder="Contoh: Pulpen"
                value={name}
              />
              <label htmlFor="product-price">Harga (Rp)</label>
              <input
                id="product-price"
                inputMode="numeric"
                min="1"
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Contoh: 5000"
                type="number"
                value={price}
              />
              <span className="field-hint">Harga harus lebih dari 0.</span>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="dialog-actions">
                <button className="button button-outline" onClick={onClose} type="button">
                  Batal
                </button>
                <button className="button button-primary" type="submit">
                  {mode === "add" ? "Simpan Produk" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (error) {
      console.error("Gagal membaca daftar produk dari penyimpanan lokal.", error);
      return INITIAL_PRODUCTS;
    }
  });
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Gagal menyimpan daftar produk ke penyimpanan lokal.", error);
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return products.filter((product) =>
      product.name.toLocaleLowerCase("id").includes(normalizedQuery),
    );
  }, [products, query]);

  function saveProduct(values) {
    if (dialog.mode === "add") {
      const id = products.reduce((largest, item) => Math.max(largest, item.id), 0) + 1;
      setProducts((current) => [...current, { id, ...values }]);
    } else {
      setProducts((current) =>
        current.map((item) => (item.id === dialog.product.id ? { ...item, ...values } : item)),
      );
    }
    setDialog(null);
  }

  function deleteProduct() {
    setProducts((current) => current.filter((item) => item.id !== dialog.product.id));
    setDialog(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a aria-label="ITS Manajemen Produk" className="brand" href="/">
            <span className="brand-mark">ITS</span>
            <span className="brand-copy">
              <strong>Institut Teknologi</strong>
              <small>Sepuluh Nopember</small>
            </span>
          </a>
          <span className="topbar-label">Dashboard Produk</span>
        </div>
      </header>

      <main className="main-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Katalog</p>
            <h1>Manajemen Produk</h1>
            <p className="page-description">
              Kelola daftar produk dan harga dalam satu tempat.
            </p>
          </div>
          <button
            className="button button-primary add-button"
            onClick={() => setDialog({ mode: "add" })}
            type="button"
          >
            <Icon name="plus" size={17} />
            Tambah Produk
          </button>
        </div>

        <section aria-label="Daftar produk" className="product-panel">
          <div className="list-toolbar">
            <label className="search-box">
              <Icon name="search" size={18} />
              <input
                aria-label="Cari nama produk"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama produk..."
                type="search"
                value={query}
              />
            </label>
            <span className="product-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? "produk" : "produk"}
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <span className="product-id">ID: {product.id}</span>
                  <h2>{product.name}</h2>
                  <p className="product-price">Rp{formatPrice(product.price)}</p>
                  <div className="card-actions">
                    <button
                      aria-label={`Edit ${product.name}`}
                      className="button button-outline"
                      onClick={() => setDialog({ mode: "edit", product })}
                      type="button"
                    >
                      <Icon name="edit" size={15} />
                      Edit
                    </button>
                    <button
                      aria-label={`Hapus ${product.name}`}
                      className="button button-danger-outline"
                      onClick={() => setDialog({ mode: "delete", product })}
                      type="button"
                    >
                      <Icon name="trash" size={15} />
                      Hapus
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="search" size={23} />
              </span>
              <h2>{products.length ? "Produk tidak ditemukan" : "Belum ada produk"}</h2>
              <p>
                {products.length
                  ? `Tidak ada produk dengan nama "${query.trim()}". Coba kata kunci lain.`
                  : "Tambahkan produk pertama Anda untuk mulai mengelola katalog."}
              </p>
              {!products.length && (
                <button
                  className="button button-primary"
                  onClick={() => setDialog({ mode: "add" })}
                  type="button"
                >
                  <Icon name="plus" size={17} />
                  Tambah Produk
                </button>
              )}
            </div>
          )}

          <div className="list-footer">
            Menampilkan {filteredProducts.length} dari {products.length} produk
          </div>
        </section>
      </main>

      <footer className="footer">
        <span className="footer-brand">ITS · Institut Teknologi Sepuluh Nopember</span>
        <span>Manajemen Produk</span>
      </footer>

      {dialog && (
        <ProductDialog
          mode={dialog.mode}
          onClose={() => setDialog(null)}
          onDelete={deleteProduct}
          onSave={saveProduct}
          product={dialog.product}
        />
      )}
    </div>
  );
}
