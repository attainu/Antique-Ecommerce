const { Schema, model } =require('mongoose');

const WishlistSchema= new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    products: [ { 
        type: Schema.Types.ObjectId,
        ref: 'products'
    } ] 
})

const Wishlist = model('Wishlist', WishlistSchema)

module.exports = Wishlist