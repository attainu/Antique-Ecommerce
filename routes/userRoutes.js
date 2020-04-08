const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();
const {
  loginUser,
  registerUser,
  changePassword,
  deactivateAccount,
  logout,
  resetPassword
} = require("../controllers/userController");

// DB routes
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/change-password", auth, changePassword);
router.post("/deactivate", auth, deactivateAccount);
router.post("/reset-password", resetPassword);
router.delete("/logout", auth, logout)
module.exports = router;
