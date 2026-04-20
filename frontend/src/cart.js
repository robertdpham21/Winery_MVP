const CART_KEY = 'winery_cart'

export const getCart = () => {
  const cart = localStorage.getItem(CART_KEY)
  return cart ? JSON.parse(cart) : []
}

export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
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
  localStorage.removeItem(CART_KEY)
}

export const getCartTotal = () => {
  const cart = getCart()
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}