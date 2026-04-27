const getCartKey = () => {
  const token = localStorage.getItem('cart_user')
  return token ? `winery_cart_${token}` : 'winery_cart'
}

export const TAX_RATE = 0.0825

export const setCartUser = (userId) => {
  const nextUserId = userId ? String(userId) : ''
  const currentUserId = localStorage.getItem('cart_user') || ''

  if (nextUserId) {
    localStorage.setItem('cart_user', nextUserId)
  } else {
    localStorage.removeItem('cart_user')
  }

  if (currentUserId !== nextUserId) {
    window.dispatchEvent(new Event('cart-updated'))
  }
}

export const getCart = () => {
  const cart = localStorage.getItem(getCartKey())
  return cart ? JSON.parse(cart) : []
}

export const saveCart = (cart) => {
  localStorage.setItem(getCartKey(), JSON.stringify(cart))
  window.dispatchEvent(new Event('cart-updated'))
}

export const addToCart = (wine, quantity = 1) => {
  const cart = getCart()
  const existing = cart.find((item) => item.wineID === wine.wineID)

  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({
      wineID: wine.wineID,
      name: wine.name,
      price: parseFloat(wine.price),
      quantity,
      stock_quantity: wine.stock_quantity,
    })
  }

  saveCart(cart)
  return cart
}

export const updateQuantity = (wineID, quantity) => {
  const cart = getCart()
  const item = cart.find((item) => item.wineID === wineID)
  if (item) {
    item.quantity = quantity
  }
  saveCart(cart)
  return cart
}

export const removeFromCart = (wineID) => {
  const cart = getCart().filter((item) => item.wineID !== wineID)
  saveCart(cart)
  return cart
}

export const clearCart = () => {
  localStorage.removeItem(getCartKey())
  localStorage.removeItem('winery_cart')
  window.dispatchEvent(new Event('cart-updated'))
}

export const getCartSubtotal = () => {
  const cart = getCart()
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}

export const getCartTax = () => {
  return getCartSubtotal() * TAX_RATE
}

export const getCartTotal = () => {
  return getCartSubtotal() + getCartTax()
}