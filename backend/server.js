import express from 'express';
import cors from 'cors';
import requireAdmin from './middleware/admin.js';
import attachRole from './middleware/attachRole.js';
import dotenv from 'dotenv';
dotenv.config();

import { Sequelize, DataTypes } from 'sequelize';
import verifyToken from './middleware/auth.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5001;
const DB_SCHEMA = process.env.DB_SCHEMA || 'app';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  define: {
    schema: DB_SCHEMA,
  },
});

// ---- MODELS ----

const User = sequelize.define('users', {
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'userID',
  },
  asgardeo_sub: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  FirstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'FirstName',
  },
  LastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'LastName',
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  address: {
    type: DataTypes.TEXT,
  },
  Email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Email',
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  is_age_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'customer',
  },
}, {
  schema: DB_SCHEMA,
  tableName: 'users',
  timestamps: false,
});

const Wine = sequelize.define('wines', {
  wineID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'wineID',
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  wine_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  vintage_year: {
    type: DataTypes.INTEGER,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  image_url: {
    type: DataTypes.TEXT,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  schema: DB_SCHEMA,
  tableName: 'wines',
  timestamps: false,
});

const Order = sequelize.define('orders', {
  orderID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'orderID',
  },
  userID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userID',
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stripe_payment_id: {
    type: DataTypes.STRING(255),
  },
  payment_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
  },
  order_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
  },
  ordered_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  schema: DB_SCHEMA,
  tableName: 'orders',
  timestamps: false,
});

const OrderItem = sequelize.define('order_items', {
  linkingID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'linkingID',
  },
  orderID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'orderID',
  },
  wineID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'wineID',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  schema: DB_SCHEMA,
  tableName: 'order_items',
  timestamps: false,
});

// ---- RELATIONSHIPS ----

User.hasMany(Order, { foreignKey: 'userID' });
Order.belongsTo(User, { foreignKey: 'userID' });

Order.hasMany(OrderItem, { foreignKey: 'orderID' });
OrderItem.belongsTo(Order, { foreignKey: 'orderID' });

Wine.hasMany(OrderItem, { foreignKey: 'wineID' });
OrderItem.belongsTo(Wine, { foreignKey: 'wineID' });

// Admin middleware chain
const adminAuth = [verifyToken, attachRole(User), requireAdmin];

// ---- WINE ROUTES ----

// GET basic route 
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// GET all wines
app.get('/api/wines', async (req, res) => {
  try {
    const wines = await Wine.findAll();
    res.json(wines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wines' });
  }
});

// GET wine by ID
app.get('/api/wines/:wineID', async (req, res) => {
  try {
    const wine = await Wine.findByPk(req.params.wineID);
    if (!wine) return res.status(404).json({ error: 'Wine not found' });
    res.json(wine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wine' });
  }
});

// POST create a new wine
app.post('/api/wines', adminAuth, async (req, res) => {
  try {
    const { name, wine_type, description, vintage_year, price, stock_quantity, image_url } = req.body;
    const wine = await Wine.create({
      name,
      wine_type,
      description,
      vintage_year,
      price,
      stock_quantity,
      image_url,
      is_active: true,
    });
    res.status(201).json(wine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create wine' });
  }
});

// PUT update a wine
app.put('/api/wines/:wineID', adminAuth, async (req, res) => {
  try {
    const wine = await Wine.findByPk(req.params.wineID);
    if (!wine) return res.status(404).json({ error: 'Wine not found' });
    await wine.update(req.body);
    res.json(wine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update wine' });
  }
});

// ---- AUTH-PROTECTED ROUTES ----

// GET /api/users/me - check if logged-in user has a profile
app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { asgardeo_sub: req.userId } });
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/me - customer updates their own profile
app.put('/api/users/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { asgardeo_sub: req.userId } });
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    await user.update(req.body);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/me/orders - customer views their own orders
app.get('/api/users/me/orders', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { asgardeo_sub: req.userId } });
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    const orders = await Order.findAll({
      where: { userID: user.userID },
      include: [{ model: OrderItem, include: [{ model: Wine, attributes: ['name', 'price'] }] }],
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/users/me/orders/:orderID - customer views a single order
app.get('/api/users/me/orders/:orderID', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ where: { asgardeo_sub: req.userId } });
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    const order = await Order.findOne({
      where: { orderID: req.params.orderID, userID: user.userID },
      include: [{ model: OrderItem, include: [{ model: Wine, attributes: ['name', 'price'] }] }],
    });
    if (!order) return res.status(403).json({ error: 'Order not found or not yours' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

 // ---- USER ROUTES ----

// GET all users
app.get('/api/users', adminAuth, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user by ID
app.get('/api/users/:userID', adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userID);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST complete profile (uses JWT for identity)
app.post('/api/users/complete-profile', verifyToken, async (req, res) => {
  try {
    const existing = await User.findOne({ where: { asgardeo_sub: req.userId } });
    if (existing) return res.status(400).json({ error: 'Profile already exists' });

    const { FirstName, LastName, Email, date_of_birth, phone, address } = req.body;

    // Calculate age
    const dob = new Date(date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 21) {
      return res.status(403).json({ error: 'You must be 21 or older to register' });
    }

    const user = await User.create({
      asgardeo_sub: req.userId,
      FirstName: FirstName || '',
      LastName: LastName || '',
      Email: Email || '',
      date_of_birth,
      phone,
      address,
      is_age_verified: true,
      is_active: true,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// PUT update user
app.put('/api/users/:userID', adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userID);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update(req.body);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE soft-delete user (set is_active = false)
app.delete('/api/users/:userID', adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userID);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update({ is_active: false });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ---- ORDER ROUTES ----

// GET all orders (admin)
app.get('/api/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['FirstName', 'LastName', 'Email'] },
        { model: OrderItem, include: [{ model: Wine, attributes: ['name', 'price'] }] },
      ],
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET order by ID (admin)
app.get('/api/orders/:orderID', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderID, {
      include: [
        { model: User, attributes: ['FirstName', 'LastName', 'Email'] },
        { model: OrderItem, include: [{ model: Wine, attributes: ['name', 'price'] }] },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET orders for a specific user
app.get('/api/users/:userID/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userID: req.params.userID },
      include: [
        { model: OrderItem, include: [{ model: Wine, attributes: ['name', 'price'] }] },
      ],
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// POST /api/orders - create order after payment
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, stripe_payment_id } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(stripe_payment_id);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not confirmed' });
    }

    // Get user from JWT
    const user = await User.findOne({ where: { asgardeo_sub: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate total and validate stock
    let total_amount = 0;
    for (const item of items) {
      const wine = await Wine.findByPk(item.wineID);
      if (!wine) return res.status(404).json({ error: `Wine ${item.wineID} not found` });
      if (wine.stock_quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${wine.name}` });
      }
      total_amount += parseFloat(wine.price) * item.quantity;
    }

    // Create order
    const order = await Order.create({
      userID: user.userID,
      total_amount,
      stripe_payment_id,
      payment_status: 'paid',
      order_status: 'pending',
    });

    // Create order items and decrement stock
    for (const item of items) {
      const wine = await Wine.findByPk(item.wineID);
      await OrderItem.create({
        orderID: order.orderID,
        wineID: item.wineID,
        quantity: item.quantity,
        unit_price: wine.price,
      });
      await wine.update({ stock_quantity: wine.stock_quantity - item.quantity });
    }

    const fullOrder = await Order.findByPk(order.orderID, {
      include: [{ model: OrderItem, include: [{ model: Wine, attributes: ['name', 'price'] }] }],
    });

    res.status(201).json(fullOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT update order status (admin)
app.put('/api/orders/:orderID', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderID, {
      include: [{ model: OrderItem }],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const { order_status } = req.body;

    // If cancelling, restock the items
    if (order_status === 'cancelled' && order.order_status !== 'cancelled') {
      for (const item of order.order_items) {
        const wine = await Wine.findByPk(item.wineID);
        await wine.update({ stock_quantity: wine.stock_quantity + item.quantity });
      }
    }

    await order.update(req.body);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE remove an item from an order (admin)
app.delete('/api/orders/:orderID/items/:linkingID', adminAuth, async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.linkingID);
    if (!item) return res.status(404).json({ error: 'Order item not found' });

    // Restock the wine
    const wine = await Wine.findByPk(item.wineID);
    await wine.update({ stock_quantity: wine.stock_quantity + item.quantity });

    // Adjust order total
    const order = await Order.findByPk(req.params.orderID);
    const newTotal = parseFloat(order.total_amount) - (item.unit_price * item.quantity);
    await order.update({ total_amount: newTotal });

    await item.destroy();
    res.json({ message: 'Item removed from order' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove order item' });
  }
});

// ---- PAYMENT ROUTES ----

// POST /api/cart/validate - check stock before payment
app.post('/api/cart/validate', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;
    const results = [];

    for (const item of items) {
      const wine = await Wine.findByPk(item.wineID);
      if (!wine) {
        results.push({ wineID: item.wineID, valid: false, error: 'Wine not found' });
      } else if (wine.stock_quantity < item.quantity) {
        results.push({ wineID: item.wineID, name: wine.name, valid: false, error: `Only ${wine.stock_quantity} in stock` });
      } else {
        results.push({ wineID: item.wineID, name: wine.name, valid: true });
      }
    }

    const allValid = results.every((r) => r.valid);
    res.json({ valid: allValid, items: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to validate cart' });
  }
});

// POST /api/payments/create-intent - create Stripe payment intent
app.post('/api/payments/create-intent', verifyToken, async (req, res) => {
  try {
    const { items } = req.body;

    // Calculate total server-side
    let total = 0;
    for (const item of items) {
      const wine = await Wine.findByPk(item.wineID);
      if (!wine) return res.status(404).json({ error: `Wine ${item.wineID} not found` });
      if (wine.stock_quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${wine.name}` });
      }
      total += parseFloat(wine.price) * item.quantity;
    }

    // Stripe expects amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
    });

    res.json({ clientSecret: paymentIntent.client_secret, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// ---- START SERVER ----

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error: ', err);
    process.exit(1);
  }
};

startServer();