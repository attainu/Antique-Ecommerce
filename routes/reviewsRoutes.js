const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();
const { addReview, getReviews, myReviews } = require("../controllers/reviewsController");

router.post("/addreview", auth, addReview);
router.post("/getreviews", auth, getReviews);
router.get("/myreviews", auth, myReviews);

module.exports = router;