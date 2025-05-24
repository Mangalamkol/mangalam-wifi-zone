const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { extractCouponsFromPDF } = require("../coupons/extractCoupons");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

let coupons = {};  // In-memory for now; later can switch to DB

router.post("/upload", upload.single("pdf"), async (req, res) => {
  const plan = req.body.plan;
  if (!plan) return res.status(400).send("Plan name required");

  try {
    const filePath = path.resolve(req.file.path);
    const codes = await extractCouponsFromPDF(filePath);
    coupons[plan] = (coupons[plan] || []).concat(codes.map(code => ({
      code,
      used: false,
      user: null,
      purchasedAt: null,
    })));
    fs.unlinkSync(filePath);
    res.json({ message: "Uploaded successfully", total: codes.length });
  } catch (err) {
    res.status(500).send("Failed to extract codes");
  }
});

router.post("/purchase", (req, res) => {
  const { plan, mobile } = req.body;
  if (!plan || !mobile) return res.status(400).send("Plan and mobile required");

  const planCoupons = coupons[plan] || [];
  const available = planCoupons.find(c => !c.used);

  if (!available) return res.status(404).send("No coupons available");

  available.used = true;
  available.user = mobile;
  available.purchasedAt = new Date().toISOString();
  res.json({ coupon: available.code });
});

router.get("/stats", (req, res) => {
  const stats = {};
  for (const [plan, list] of Object.entries(coupons)) {
    stats[plan] = {
      total: list.length,
      used: list.filter(c => c.used).length,
      available: list.filter(c => !c.used).length
    };
  }
  res.json(stats);
});

module.exports = router;