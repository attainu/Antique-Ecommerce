const { Schema, model } =require('mongoose');
const OrdersSchema= new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    orders: [
        {
            products: [{
                productId: Schema.Types.ObjectId,
                title: String,
                price: Number,
                image: String,
                quantity: Number,
                totalPrice: Number
            }],
            orderValue :Number,
            numberOfProducts :Number,
            orderedOn :Date,
            success :Boolean
        }
    ]
})
const Orders = model('Orders', OrdersSchema)
module.exports = Orders;