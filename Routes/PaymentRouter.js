const express = require("express");
const { processPayment } = require("../Controller/PaymentController");
const router = express.Router();

router.post("/process-payment", processPayment);

module.exports = router;
