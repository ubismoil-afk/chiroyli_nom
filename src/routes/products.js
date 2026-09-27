const express = require("express");
const Product = require("../models/Product");
const { requireAuth, requereOwner } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

router.post("/", async (req, res) => {
  const { name, price, description } = req.body;

  if (typeof name !== "string" || !name || typeof price !== "number") {
    return res.status(400).json({ error: "name (string) and price (number) are required" });
  }

  const product = await Product.create({
    name,
    price,
    description: typeof description === "string" ? description : "",
    createdBy: req.user.id,
  });

  res.status(201).json(product);
});

router.put("/:id", requereOwner, async (req, res) => {
  const { name, price, description } = req.body;
  const update = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name) {
      return res.status(400).json({ error: "name must be a non-empty string" });
    }
    update.name = name;
  }
  if (price !== undefined) {
    if (typeof price !== "number") {
      return res.status(400).json({ error: "price must be a number" });
    }
    update.price = price;
  }
  if (description !== undefined) {
    if (typeof description !== "string") {
      return res.status(400).json({ error: "description must be a string" });
    }
    update.description = description;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

router.delete("/:id", requereOwner, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(204).send();
});

module.exports = router;
