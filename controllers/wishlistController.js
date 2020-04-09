const Users = require("../models/User");
const Products = require("../models/Products");
const Wishlist = require("../models/Wishlist");

module.exports = {

    async addToWishlist(req,res) {
        const userId = req.session.userId;
        const productId = req.query.pr;

        try{
            const product = await Products.findById(productId);
            if(!product){
                return res.status(400).json({ Error: "invalid product_id" })
            }
            const user = await Users.findById(userId);
            let wishlist = await Wishlist.findOne({ userId: userId });
            if(!wishlist) {
                wishlist = await Wishlist.create({ userId: userId });
                user.userWishlist = wishlist._id;
                await user.save();                
            }
            wishlist.products.forEach( product => {
                if( product == productId ){
                    throw new Error("product already in wishlist")
                }
            });
            wishlist.products.push({ productId: productId, 
                title: product.title, 
                price: product.price, 
                image: product.image 
            });
            await wishlist.save();
            res.json({ product_added_to_wishlist: true })
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message})
        }
    },

    async removeFromWishlist(req,res) {
        const userId = req.session.userId;
        const productId = req.query.pr;

        try{
            let wishlist = await Wishlist.findOne({ userId: userId });
            if(!wishlist){
                res.status(400).json({Error: "no product added to wishlist"});
            }else{
                let productIndex = -1;
                for(index in wishlist.products) {
                    if( wishlist.products[index] == productId ){                        
                        productIndex = index;                    
                    }
                };
                if(productIndex == -1){
                    res.status(400).json({ Error: "this product is not in wishlist"});
                }else{
                    wishlist.products.splice(productIndex,1);
                    await wishlist.save();
                    res.json({ product_removed_from_wishlist: true})
                }
            }
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message})
        }
    },

    async emptyWishlist(req,res) {
        const userId = req.session.userId;

        try {
            let wishlist = await Wishlist.findOne({ userId: userId });
            if(!wishlist) {
                res.status(400).json({Error: "no product added to wishlist"});
            }else if(wishlist.products.length == 0){
                res.status(400).json({Error: "wishlist is already empty"});
            }else{
                wishlist.products = [];
                await wishlist.save();
                res.json({empty_wishlist_successfull: true})
            }
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message})
        }
    }
}