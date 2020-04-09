const { Schema, model } =require('mongoose');

const WishlistSchema= new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    products: [
        {
            productId: Schema.Types.ObjectId,
            title: String,
            price: Number,
            image: String
        }
    ] 
})

const Wishlist = model('Wishlist', WishlistSchema)

module.exports = Wishlist