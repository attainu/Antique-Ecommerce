const { Router } = require("express");
const auth = require("../middleware/authenticate");
const router = Router();
const {
    confirmEmail, 
    regenerateRegisterToken, 
    sendForgotPasswordEmail, 
    resetEmailConfirmation} = require("../controllers/userEmailController");

// get routes
router.get("/confirm/:confirmToken", confirmEmail);
router.get("/reset/:resetToken", resetEmailConfirmation);

// post routes
router.post("/regenerate", regenerateRegisterToken);
router.post("/forgot-password", sendForgotPasswordEmail);

module.exports = router