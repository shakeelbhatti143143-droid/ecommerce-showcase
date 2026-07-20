import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { products, sizes, shoeSizes, colors } from '../data/products'
import { useShop } from '../context/ShopContext'
function ProductCard({ product }) {
  const navigate = useNavigate()
  const isShoe = product.category === 'Shoes'
  const [size, setSize] = useState(isShoe ? '42' : 'Medium')
  const [color, setColor] = useState('Black')
  const [quantity, setQuantity] = useState(1)
  const { user, addToCart, placeOrder } = useShop()
  const selection = { size, color: isShoe ? color : '', quantity }
  const handleAddToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    addToCart(product, selection)
  }
  const handleOrderNow = () => {
    if (!user) {
      navigate('/login')
      return
    }
    placeOrder(product, selection)
  }
  return <article className="shop-product-card"><div className="shop-product-image"><img src={product.image} alt={product.name} />{product.badge && <span>{product.badge}</span>}<button className="shop-wishlist" aria-label={`Add ${product.name} to wishlist`}>♡</button></div><div className="shop-product-info"><div className="shop-product-title"><div><p className="shop-category-label">{product.category}</p><h3>{product.name}</h3></div><strong>${product.price}</strong></div><p className="shop-rating">★★★★★ <small>{product.rating}</small></p><p className="shop-product-description">{product.description}</p>{isShoe && <label className="shop-option">Colour<select value={color} onChange={(event) => setColor(event.target.value)}>{colors.map((item) => <option key={item}>{item}</option>)}</select></label>}<label className="shop-option">Size<select value={size} onChange={(event) => setSize(event.target.value)}>{(isShoe ? shoeSizes : sizes).map((item) => <option key={item}>{item}</option>)}</select></label><div className="shop-card-actions"><div className="shop-quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}>+</button></div><button className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button></div><button className="shop-order-now" onClick={handleOrderNow}>Order Now →</button></div></article>
}

export default function Shop() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All Products')
  const displayedProducts = useMemo(() => products.filter((product) => (category === 'All Products' || product.category === category) && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [query, category])
  return <><section className="shop-hero"><div className="container"><span className="section-label">Shop the edit</span><h1>Designed for your <span className="gradient-text">everyday</span></h1><p>Find refined outerwear and iconic footwear, selected for the way you move.</p></div></section><section className="section shop-section"><div className="container"><div className="shop-toolbar"><div className="shop-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." aria-label="Search products" /></div><div className="shop-categories" aria-label="Product categories">{['All Products', 'Jackets', 'Shoes'].map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className="shop-results"><p>{displayedProducts.length} products</p><span>{category}</span></div>{displayedProducts.length ? <div className="shop-product-grid">{displayedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="shop-no-results"><strong>No products found</strong><p>Try another search or browse all products.</p></div>}</div></section></>
}
