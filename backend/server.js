const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 👈 دي أهم سطر

let cart = [];

app.post("/cart", (req, res) => {
  cart.push(req.body);
  res.json(cart);
});

app.get("/cart", (req, res) => {
  res.json(cart);
});

// الصفحة
app.get("/cart-page", (req, res) => {
  res.sendFile(path.join(__dirname, "cart.html"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});