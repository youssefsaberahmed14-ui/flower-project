const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Main shop page - before static middleware
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Note: Static files middleware moved to the end of the file, after all API routes

// Dynamic products database
let products = [
  { id: 1, name: 'Classic Red Rose Bouquet', sub: '12 red roses + gold ribbon', price: 250, icon: '🌹', bg: 'bg-pink', tag: 'Most Popular' },
  { id: 2, name: 'Baby Rose Bouquet', sub: 'Gradient pink rose collection', price: 320, icon: '🌸', bg: 'bg-red', tag: null },
  { id: 3, name: 'Royal Lavender Bouquet', sub: 'Purple roses + natural lavender', price: 380, icon: '💜', bg: 'bg-purple', tag: 'New' },
  { id: 4, name: 'Sunflower & Rose Mix', sub: 'Beautiful mix of sunflowers and white roses', price: 280, icon: '🌻', bg: 'bg-yellow', tag: null },
  { id: 5, name: 'White Joy Bouquet', sub: 'Pure white roses perfect for weddings', price: 450, icon: '🤍', bg: 'bg-white', tag: null },
  { id: 6, name: 'Rainbow Bouquet', sub: 'Premium mix of all beautiful colors', price: 500, icon: '💐', bg: 'bg-mixed', tag: 'Premium' },
];

// Promo codes
let promoCodes = [
  { id: 1, code: 'WELCOME20', discount: 20, type: 'percentage', active: true },
  { id: 2, code: 'SAVE50', discount: 50, type: 'fixed', active: true },
];

// Customers data
let customers = [];
let orderIdCounter = 2000;
let customerIdCounter = 0;

let cart = [];

// Order data - now dynamic
let orders = [];

// API - Get all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// API - Add product
app.post("/api/products", (req, res) => {
  const { name, sub, price, icon, bg, tag } = req.body;
  const newProduct = {
    id: Math.max(...products.map(p => p.id), 0) + 1,
    name,
    sub,
    price,
    icon: icon || '🌹',
    bg: bg || 'bg-pink',
    tag: tag || null
  };
  products.push(newProduct);
  res.json(newProduct);
});

// API - Update product
app.put("/api/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[productIndex] = { ...products[productIndex], ...req.body };
  res.json(products[productIndex]);
});

// API - Delete product
app.delete("/api/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  products = products.filter(p => p.id !== productId);
  res.json({ success: true, message: 'Product deleted' });
});

// API - Get all promo codes
app.get("/api/promo-codes", (req, res) => {
  res.json(promoCodes);
});

// API - Add promo code
app.post("/api/promo-codes", (req, res) => {
  const { code, discount, type } = req.body;
  const newPromo = {
    id: Math.max(...promoCodes.map(p => p.id), 0) + 1,
    code: code.toUpperCase(),
    discount,
    type: type || 'percentage',
    active: true
  };
  promoCodes.push(newPromo);
  res.json(newPromo);
});

// API - Update promo code
app.put("/api/promo-codes/:id", (req, res) => {
  const promoId = parseInt(req.params.id);
  const promoIndex = promoCodes.findIndex(p => p.id === promoId);
  if (promoIndex === -1) {
    return res.status(404).json({ error: 'Promo code not found' });
  }
  promoCodes[promoIndex] = { ...promoCodes[promoIndex], ...req.body };
  res.json(promoCodes[promoIndex]);
});

// API - Delete promo code
app.delete("/api/promo-codes/:id", (req, res) => {
  const promoId = parseInt(req.params.id);
  promoCodes = promoCodes.filter(p => p.id !== promoId);
  res.json({ success: true, message: 'Promo code deleted' });
});

// API - Get all orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// API - Update order status
app.put("/api/orders/:id", (req, res) => {
  const orderId = parseInt(req.params.id);
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  orders[orderIndex] = { ...orders[orderIndex], ...req.body };
  res.json(orders[orderIndex]);
});

// API - Get customers
app.get("/api/customers", (req, res) => {
  res.json(customers);
});

// API - Dashboard stats (dynamic based on actual orders)
app.get("/api/dashboard", (req, res) => {
  const totalSales = orders.reduce((sum, o) => sum + (o.totalPrice || o.price), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // Daily sales
  const dailySales = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOrders = orders.filter(o => new Date(o.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateStr);
    const amount = dayOrders.reduce((sum, o) => sum + (o.totalPrice || o.price), 0);
    dailySales.push({ date: dateStr, amount });
  }

  // Top products
  const productSales = {};
  orders.forEach(o => {
    if (o.items && Array.isArray(o.items)) {
      o.items.forEach(item => {
        const productName = item.productName || item.name;
        productSales[productName] = (productSales[productName] || 0) + item.quantity;
      });
    }
  });
  const topProducts = Object.entries(productSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  res.json({
    totalSales,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    averageOrderValue,
    salesGrowth: 12,
    ordersGrowth: 8,
    dailySales: dailySales.length > 0 ? dailySales : [],
    topProducts: topProducts.length > 0 ? topProducts : [],
    orders: orders.slice(0, 10),
    productsCount: products.length,
    customersCount: customers.length
  });
});

// API - Create order (from cart)
app.post("/api/orders", (req, res) => {
  const { customerName, customerEmail, customerPhone, deliveryAddress, specialNotes, paymentMethod, items, totalPrice } = req.body;
  const newOrder = {
    id: ++orderIdCounter,
    orderDate: new Date().toISOString(),
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    specialNotes,
    paymentMethod: paymentMethod || 'cash',
    items,
    totalPrice,
    status: paymentMethod === 'online' ? 'pending_payment' : 'pending',
    statusLabel: paymentMethod === 'online' ? 'Pending Payment' : 'Pending'
  };
  orders.push(newOrder);

  // Add customer if not exists
  const existingCustomer = customers.find(c => c.email === customerEmail);
  if (!existingCustomer) {
    customers.push({
      id: ++customerIdCounter,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      totalOrders: 1,
      totalSpent: totalPrice,
      lastOrderDate: new Date().toISOString()
    });
  } else {
    existingCustomer.totalOrders++;
    existingCustomer.totalSpent += totalPrice;
    existingCustomer.lastOrderDate = new Date().toISOString();
  }

  res.json(newOrder);
});

app.post("/cart", (req, res) => {
  const { productId, options = {} } = req.body;
  const product = products.find(item => item.id === productId);
  if (!product) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const normalizedOptions = {
    flowerShape: options.flowerShape || 'round',
    bouquetColor: options.bouquetColor || 'red',
    wrapColor: options.wrapColor || 'paper',
  };

  const optionsKey = JSON.stringify(normalizedOptions);
  const existing = cart.find(item => item.productId === productId && item.optionsKey === optionsKey);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      cartId: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      productId,
      qty: 1,
      optionsKey,
      options: normalizedOptions,
      ...product,
    });
  }

  res.json(cart);
});

app.get("/cart", (req, res) => {
  res.json(cart);
});

app.delete("/cart", (req, res) => {
  cart = [];
  res.json({ ok: true });
});

app.delete("/cart/:cartId", (req, res) => {
  const cartId = req.params.cartId;
  const removeAll = req.query.all === 'true';
  const idx = cart.findIndex(item => item.cartId === cartId);
  if (idx !== -1) {
    if (removeAll || cart[idx].qty <= 1) {
      cart.splice(idx, 1);
    } else {
      cart[idx].qty -= 1;
    }
  }
  res.json(cart);
});

// Cart page
app.get("/cart-page", (req, res) => {
  res.sendFile(path.join(__dirname, "cart.html"));
});

app.get("/shop", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Admin dashboard
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Dashboard page
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Static files middleware (after all API and HTML routes)
app.use('/static', express.static(path.join(__dirname, '..')));
app.use(express.static(__dirname));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  console.log("Admin Dashboard: http://localhost:3000/admin");
});