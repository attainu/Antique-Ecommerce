const { checkout, myOrders} = require("../controllers/ordersController");
const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();

router.get("/checkout", auth, checkout);
router.get("/myorders", auth, myOrders);

module.exports = router;