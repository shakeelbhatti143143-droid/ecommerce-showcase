import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authenticateShopper, createShopAccount } from '../services/shopAuth'

const ShopContext = createContext(null)
const CART_KEY = 'shopsphere_cart'
const USER_KEY = 'shopsphere_shopper'

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] } })
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } })
  const [loginOpen, setLoginOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [order, setOrder] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)) }, [cart])
  useEffect(() => { if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); else localStorage.removeItem(USER_KEY) }, [user])
  useEffect(() => { if (user) return undefined; const timer = window.setTimeout(() => setLoginOpen(true), 10000); return () => window.clearTimeout(timer) }, [user])
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(timer) }, [toast])

  const requireLogin = (action) => { if (!user) { setLoginOpen(true); return false } action?.(); return true }
  const addToCart = (product, selection) => requireLogin(() => {
    const key = `${product.id}-${selection.size}-${selection.color || ''}`
    setCart((items) => { const exists = items.find((item) => item.key === key); return exists ? items.map((item) => item.key === key ? { ...item, quantity: item.quantity + selection.quantity } : item) : [...items, { ...product, ...selection, key }] })
    setToast(`${product.name} added to cart`)
  })
  const updateQuantity = (key, quantity) => setCart((items) => quantity < 1 ? items.filter((item) => item.key !== key) : items.map((item) => item.key === key ? { ...item, quantity } : item))
  const placeOrder = (product, selection) => requireLogin(() => setOrder({ ...product, ...selection }))
  const login = async ({ email, password, name, createAccount }) => {
    const result = createAccount ? await createShopAccount({ name, email, password }) : await authenticateShopper({ email, password })
    if (result.error) return { error: result.error }
    const shopper = result.data
    setUser(shopper)
    localStorage.setItem('loggedIn', 'true')
    setLoginOpen(false)
    setToast(`Welcome, ${shopper.name}!`)
    return { data: shopper }
  }
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])
  return <ShopContext.Provider value={{ cart, user, loginOpen, setLoginOpen, cartOpen, setCartOpen, order, setOrder, toast, setToast, total, requireLogin, addToCart, updateQuantity, placeOrder, login }}>{children}</ShopContext.Provider>
}

export const useShop = () => useContext(ShopContext)
