const { Schema, model } =require('mongoose');

const CartSchema= new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    products: [
        {
            productId: Schema.Types.ObjectId,
            title: String,
            price: Number,
            image: String,
            quantity: Number,
            totalPrice: Number
        }
    ],
    cartValue: {
        type: Number,
        default: 0
    },
    numberOfProducts: {
        type: Number,
        default: 0
    } 
})

const Cart = model('Cart', CartSchema)

module.exports = Cart