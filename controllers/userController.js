const User = require("../models/User");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");

const findByEmailAndPassword = async (email,password) => {
  try {
    const user = await User.findOne({ email: email});
    if (!user) throw new Error("Incorrect credentials");
    const isMatched = await compare(password, user.password);
    if (!isMatched) throw new Error("Incorrect credentials");
    return user;
  } catch (err) {
    throw err;
  }
};

const SecretKey = (email, createdAt) => `${email}-${new Date(createdAt).getTime()}`;

module.exports = {  

  async registerUser(req, res) {
    const { name, email, password, phoneNumber} = req.body;
    try {
      if (name.length < 4 ) throw new Error("length of name should be 4 or greater");
      for( index in email ){
        if(email[index]!=='@' && index==(email.length)-1) throw new Error("invalid email, please check again");
        if(email[i]!=='@') continue;
      }
      if (password.length < 8 ) throw new Error("Password Minimum length should be 8 characters");
      for( index in password ){
        if(isNaN(password[index]) && i==(password.length)-1) throw new Error("Password should contain atleast one digit");
        if(isNaN(password[i])) continue;
      }
      for( index in password ){
        if(password[index]!==(password[index].toUpperCase()) && index==(password.length)-1) throw new Error("Password should contain atleast one uppercase char");
        if(password.value[index]!==(password.value[index].toUpperCase())) continue;
      }
      if (phoneNumber.toString().length < 10 ) throw new Error("enter a valid phone number");
      phoneNumber.toString().forEach( number =>{
        if (isNaN(number)) throw new Error("enter a valid phone number");
      })
      const user = await User.create({ ...req.body });
      await user.generateToken("confirm");
      res.status(200).json({ User_registered_successfully: true, confirmation_email_sent: true});
    } catch (err) {
      console.log(err);
      if (err.name === "ValidationError")
        return res.status(400).json({Validation_Error: err.message});
      res.json({Error: err.message});
    }
  },

  async loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ correct_credentials: false });
    try {
      const user = await findByEmailAndPassword(email, password);
      if (user.isConfirmed) {
        req.session.userId = user._id;
        return res.json({ user_login_successfully: true });
      }
      return res
        .status(403)
        .json({account_confirmed: false, email_sent: true});
    } catch (err) {
      console.log(err.message);
      res.json({Error: err.message});
    }
  },

  async changePassword(req, res) {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword)
      return res.status(400).json({ bad_request: true });
    try {
      const user = await findByEmailAndPassword(email, oldPassword);
      if (!user) {
        return res.status(401).json({ correct_credentials: false });
      }
      user.password = newPassword;
      await user.save();
      return res.json({ password_changed_successfully: true });
    } catch (err) {
      console.log(err.message);
      res.json({Error: err.message});
    }
  },

  async deactivateAccount(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ correct_credentials: false });
    try {
      await User.findOneAndDelete({ email: email })
      return res.json({ account_deactivated_successfully: true})
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ Error: "Server Error" });
    }
  },

  logout(req,res) {
    try{
      if(req.session.userId){
        req.session.destroy();
        res.json({ user_logout_successfull: true });
      }else{
        res.status(400).json({ Error: "user is not login"})
      }
    }
    catch(err){
      console.log(err);
      res.json({ Error: "server error"})
    }
  },

  async resetPassword(req, res) {
    const resetToken = req.headers.token;
    const { password, email } = req.body;
    try {
      const user = await User.findOne({ resetToken: resetToken });
      if (!user) {
        return res.status(401).json({ correct_credentials: false });
      }
      const secretKey = SecretKey(user.email, user.createdAt);
      const payload = await verify(resetToken, secretKey);
      if (payload){
        const hashedPassword = await hash(password, 10);
        await User.findOneAndUpdate(
          { email: email},
          { $set: { resetToken: "", password: hashedPassword}}
          );
        return res.json({ password_changed_successfully: true });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ Error: err.message });
    }
  }

};
