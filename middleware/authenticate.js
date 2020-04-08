var User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (!user) return res.json({ correct_credentials: false });
      return next();
    }
    return res.json({ authorised_access: false});
  } catch (err) {
    console.log(err.message);
    res.json({ Error: "Server Error" });
  }
};