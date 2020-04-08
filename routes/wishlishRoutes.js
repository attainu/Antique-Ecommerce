const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();
const { addToWishlist, removeFromWishlist, emptyWishlist } = require("../controllers/wishlistController");

router.post("/addtowishlist", auth, addToWishlist);
router.post("/removefromwishlist", auth, removeFromWishlist);
router.delete("/emptywishlist", auth, emptyWishlist);

module.exports = router;