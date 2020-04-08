const { addToCart, removeFromCart, emptyCart, myCart } = require("../controllers/cartController");
const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();

router.post("/addtocart", auth, addToCart);
router.post("/removefromcart", auth, removeFromCart);
router.delete("/emptycart", auth, emptyCart);
router.get("/mycart", auth, myCart);

module.exports = router;