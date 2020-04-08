const sendMail = require("../utils/generateEmail");
const { hash } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { Schema, model } =require('mongoose')

const UsersSchema= new Schema({
  name: {
    type : String,
    required:true,
    trim:true
  },

  email:{
    type : String,
    required:true,
    trim:true,
    unique:true
  },

  password:{
    type : String,
    required:true,
    trim:true
  },

  phoneNumber :{
    type: Number,
    required:true
  },

  dob:{
    type: Date,
    required:true
  },

  gender:{
    type:String
  },

  isConfirmed: {
    type: Boolean,
    required: true,
    default: false
  },

  confirmToken: {
    type: String,
    default: ""
  },

  resetToken: {
    type: String,
    default: ""
  },

  userCart: {
    type: Schema.Types.ObjectId,
    ref: "Cart"
  },

  userWishlist: {
    type: Schema.Types.ObjectId,
    ref: "Wishlist"
  },

  userOrders: {
    type: Schema.Types.ObjectId,
    ref: "Orders"
  },

  reviewedProducts: [
    {
    type: Schema.Types.ObjectId,
    ref: "Reviews"
    }
  ]
  }
  ,
  {timestamps:true}
);

UsersSchema.methods.generateToken = async function(mode){
  const secretKey = `${this.email}-${new Date(
    this.createdAt)
  .getTime()}`;
  const token = await sign(
    { id: this._id },
    secretKey,
    { expiresIn: "30000000" }
  );
  if (mode === "confirm") {
    this.confirmToken = token;
  } else if (mode === "reset") {
    this.resetToken = token
  }
  await this.save();
  await sendMail(mode, this.email, token);
}

UsersSchema.pre("save",async function(next) {
  try{
    const user = this;
    if (user.isModified("password")) {
      const hashedPassword = await hash(user.password, 10);
      user.password = hashedPassword;
      next();
    }
  } 
  catch(err) {
      next(err);
  };
});

const Users =model('Users',UsersSchema)

module.exports=Users
