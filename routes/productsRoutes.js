const { getProducts, getSearchProducts } = require("../controllers/productsController");
const { Router } = require("express");
const router = Router();

router.get("/products", getProducts);
router.get("/search-products", getSearchProducts)

module.exports = router;