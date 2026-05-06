const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const products = [
  { id: 1, name: 'بوكيه الورد الأحمر الكلاسيكي', sub: '12 وردة حمراء + شريطة ذهبية', price: 250, icon: '🌹', bg: 'bg-pink', tag: 'الأكثر طلباً' },
  { id: 2, name: 'بوكيه البيبي روز', sub: 'باقة وردي متدرجة الألوان', price: 320, icon: '🌸', bg: 'bg-red', tag: null },
  { id: 3, name: 'بوكيه اللافندر الملكي', sub: 'ورد بنفسجي + لافندر طبيعي', price: 380, icon: '💜', bg: 'bg-purple', tag: 'جديد' },
  { id: 4, name: 'بوكيه السنفلور والورد', sub: 'مزيج مبهج من عباد الشمس وورد أصفر وأبيض', price: 280, icon: '🌻', bg: 'bg-yellow', tag: null },
  { id: 5, name: 'بوكيه الفرح الأبيض', sub: 'ورد أبيض نقي مثالي للأعراس والمناسبات الرسمية', price: 450, icon: '🤍', bg: 'bg-white', tag: null },
  { id: 6, name: 'بوكيه قوس قزح', sub: 'خليط من أجمل الألوان في تصميم احترافي وفاخر', price: 500, icon: '💐', bg: 'bg-mixed', tag: 'مميز' },
];

let cart = [];

app.post("/cart", (req, res) => {
  const { productId } = req.body;
  const product = products.find(item => item.id === productId);
  if (!product) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  cart.push(product);
  res.json(cart);
});

app.get("/cart", (req, res) => {
  res.json(cart);
});

app.delete("/cart", (req, res) => {
  cart = [];
  res.json({ ok: true });
});

app.delete("/cart/:id", (req, res) => {
  const id = Number(req.params.id);
  const removeAll = req.query.all === 'true';
  if (removeAll) {
    cart = cart.filter(item => item.id !== id);
  } else {
    const idx = cart.findIndex(item => item.id === id);
    if (idx !== -1) {
      cart.splice(idx, 1);
    }
  }
  res.json(cart);
});

// الصفحة
app.get("/cart-page", (req, res) => {
  res.sendFile(path.join(__dirname, "cart.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});