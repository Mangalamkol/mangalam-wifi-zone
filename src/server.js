const express = require("express");
const bodyParser = require("body-parser");
const Razorpay = require("razorpay");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.post("/api/create-order", async (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;
  try {
    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send("Error creating Razorpay order");
  }
});

const couponRoutes = require("./routes/couponRoutes");
app.use("/api/coupons", couponRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port", process.env.PORT || 3000);
});