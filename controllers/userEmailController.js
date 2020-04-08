const User = require("../models/User");
const { verify } = require("jsonwebtoken");

const SecretKey = (email, createdAt) => `${email}-${new Date(createdAt).getTime()}`

module.exports = {

    async confirmEmail(req, res) {
    
        const { confirmToken } = req.params;
        try {
          const user = await User.findOne({ confirmToken:  confirmToken  });
          if (!user) {
            return res.status(401).json({ correct_credentials: false });
          }
          const secretKey = SecretKey(user.email, user.createdAt);
          const payload = await verify(confirmToken, secretKey);
          if (payload) {
            user.isConfirmed = true ;
            await user.save();
            req.user = undefined;
            req.session.userId = user._id;
            return res.json({ email_confirmed_successfully: true });
          }
        } catch (err) {
          console.log(err);
          if (err.name === "TokenExpiredError") {
            return res.json({ confirmation_token_expired: true });
          }
          console.log(err.message);
          res.json({Error: err.message});
        }
      },

      async regenerateRegisterToken(req, res) {
        const { email } = req.body;
        if (!email)
          return res.status(400).json({ correct_credentials: false });
        const user = User.findOne({ email: email});
        user.generateConfirmToken();
        res.status(202).json({ confirmation_email_resent: true });
      },

      async sendForgotPasswordEmail(req, res) {
        const { email } = req.body;
        if (!email) return res.status(400).json({ correct_credentials: false });
        try {
          const user = await User.findOne({ email: email });
          if (!user) {
            return res
              .status(400)
              .json({ correct_credentials: false });
          }
          await user.generateToken("reset");
          res.json({ reset_email_sent: true})
        } catch (err) {
          console.log(err);
          res.status(500).json({ Error: "Server Error"});
        }
      },

      async resetEmailConfirmation(req, res) {
        const { resetToken } = req.params;
        try {
          const user = await User.findOne({ resetToken: resetToken });
          if (!user) {
            return res.status(401).json({ correct_credentials: false });
          }
          const secretKey = SecretKey(user.email, user.createdAt)
          const payload = await verify(resetToken, secretKey);
          if (payload) {
            return res.json({ valid_token: true, token: resetToken, 
                message: "post with email and new password as body and token query string 'q' on '/reset-password'"})
          }
        } catch (err) {
          console.log(err);
          if (err.name === "TokenExpiredError") {
            return res.json({ reset_token_expired: true });
          }
          res.status(500).json({ Error: "Server Error" });
        }
      }
}