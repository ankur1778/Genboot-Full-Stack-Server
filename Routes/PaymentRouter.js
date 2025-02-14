const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const validatePayment = require("../MiddleWares/ValidatePayment")
const { handlePayment, getAllPayments, getSinglePayment, getUserPayments } = require("../Controller/PaymentController");
const adminAuth = require("../middlewares/AdminValidation");

const router = express.Router();
router.use(verifyToken);

router.post("/make-payment", async(req, res, next) =>{
    const {error} = validatePayment(req.body);
    if(error) {
        return res.status(400).json({success: false, message: error.details[0].message})
    }
    next();
}, handlePayment)

//get all the PAyments(admin)
router.get("/get-all-payments", adminAuth, getAllPayments);

//get the specific payment detail(admin)
router.get("/specific-payment/:id", adminAuth, getSinglePayment);

//get the user specific payment details
router.get("/user-payments", getUserPayments);

module.exports = router;