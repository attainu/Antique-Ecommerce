const Users = require("../models/User");
const Products = require("../models/Products");
const Cart = require("../models/Cart");
const Wishlist = require("../models/Wishlist");

module.exports = {

    async addToCart(req,res){
        const userId = req.session.userId;
        const productId = req.query.pr;
        const quantity = req.query.qu || 1;
        let cartValue = 0;
        let totalProducts = 0;

        try{
            const products = await Products.findById(productId);
            if(!products){
                return res.status(400).json({ Error: "invalid product_id" })
            }
            const user = await Users.findById(userId);
            let cart = await Cart.findOne({ userId: userId });
            const wishlist = await Wishlist.findOne({ userId: userId });
            if(wishlist) {
                for(productIndex in wishlist.products) {
                    if( wishlist.products[productIndex] == productId ){                        
                        wishlist.products.splice(productIndex,1);
                        await wishlist.save();                    
                    }
                };
            }
            if(!cart) {
                cartValue = products.price * quantity;
                cart = await Cart.create({ userId: userId });
                cart.products.push({productId: productId,
                    title: products.title,
                    price: products.price,
                    image: products.image,
                    quantity: quantity, 
                    totalPrice: products.price * quantity 
                });
                cart.numberOfProducts = quantity;
                cart.cartValue = cart.cartValue + cartValue;
                await cart.save();
                user.userCart = cart._id;
                await user.save();                
            }else{
                let quantityModified = false
                cart.products.forEach( product => {
                    if( product.productId == productId ){
                        product.quantity = Number(product.quantity) + Number(quantity);
                        product.totalPrice = product.quantity * products.price;
                        quantityModified = true;
                    }
                    totalProducts = Number(totalProducts) + Number(product.quantity)
                    cartValue = Number(cartValue) + Number(product.totalPrice)
                });
                if(!quantityModified) {
                    cart.products.push({productId: productId,
                        title: products.title,
                        price: products.price,
                        image: products.image,
                        quantity: quantity, 
                        totalPrice: products.price * quantity 
                    });
                    totalProducts = totalProducts + Number(quantity)
                    cartValue = cartValue + Number(products.price) * quantity;
                }
                cart.numberOfProducts = totalProducts;
                cart.cartValue = cartValue;
                await cart.save();
            }
            res.json({ product_added_to_cart: true});
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message});
        }
    },

    async removeFromCart(req,res){
        const userId = req.session.userId;
        const productId = req.query.pr;
        const quantity = req.query.qu || 1;
        let cartValue = 0;
        let totalProducts = 0;

        try{
            const products = await Products.findById(productId);
            let cart = await Cart.findOne({ userId: userId });
            if(!cart){
                res.status(400).json({Error: "cart not created"});
            }else{
                for(productIndex in cart.products) {
                    if( cart.products[productIndex].productId == productId ){
                        if(quantity > cart.products[productIndex].quantity){
                            throw new Error("cannot remove products more than in the cart itself")
                        }else if(quantity == cart.products[productIndex].quantity){
                            cart.products.splice(productIndex,1);
                            continue;
                        }else {
                            cart.products[productIndex].quantity = Number(cart.products[productIndex].quantity) - Number(quantity);
                            cart.products[productIndex].totalPrice = cart.products[productIndex].quantity * products.price;
                        }
                    }
                    totalProducts = Number(totalProducts) + Number(cart.products[productIndex].quantity);
                    cartValue = Number(cartValue) + Number(cart.products[productIndex].totalPrice);

                };
                cart.numberOfProducts = totalProducts
                cart.cartValue = cartValue;
                await cart.save();
                res.json({ product_removed_from_cart: true})
            }
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message})
        }
    },

    async emptyCart(req,res) {
        const userId = req.session.userId;

        try {
            let cart = await Cart.findOne({ userId: userId });
            if(!cart) {
                res.status(400).json({Error: "cart not created"});
            }else if(cart.products.length == 0){
                res.status(400).json({Error: "cart already empty"});
            }else{
                cart.products = [];
                cart.numberOfProducts = 0;
                cart.cartValue = 0;
                await cart.save();
                res.json({empty_cart_successfull: true})
            }
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message});
        }
    },

    async myCart(req,res) {
        const userId = req.session.userId;

        try {
            let cart = await Cart.findOne({ userId: userId });
            if(!cart) {
                res.status(400).json({Error: "cart not created"});
            }else if(cart.products.length == 0){
                res.status(400).json({Error: "cart is empty"});
            }else{
                const cartProducts = [];
                cart.products.forEach( product => {
                    cartProducts.push({
                        title: product.title,
                        price: product.price,
                        image: product.image,
                        quantity: product.quantity,
                        totalPrice: product.totalPrice
                    })
                })
                res.json({
                    cartValue: cart.cartValue,
                    numberOfProducts: cart.numberOfProducts,
                    products: cartProducts
                })
            }
        }
        catch(err) {
            console.log(err);
            res.json({Error: err.message});
        }
    }
    
}