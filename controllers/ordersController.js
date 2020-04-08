const Orders = require("../models/Orders");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Products = require("../models/Products");

module.exports = {

    async checkout (req,res){
        const userId = req.session.userId;

        try{
        const cart = await Cart.findOne({ userId: userId });
        if(!cart || cart.products.length == 0){
            return res.status(400).json({ Error: "no products added to cart" })
        }
        const user = await User.findById(userId);
        let order
        if(!user.userOrders){
            order = await Orders.create({ userId: userId });
            user.userOrders = order._id;
            user.save();
        }else {
            order = await Orders.findById(user.userOrders);
        }
        order.orders.push({ products: cart.products, orderValue: cart.cartValue, numberOfProducts: cart.numberOfProducts, orderedOn: Date.now(), success: true })
        order.save();
        cart.products = [];
        cart.cartValue = 0;
        cart.numberOfProducts = 0;
        cart.save();
        res.json({ order_placed: true});
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message});
        }
    },

    async myOrders(req,res){
        const userId = req.session.userId;

        try{
            const user = await User.findById(userId);
            if (!user.userOrders){
                res.status(404).json({ Error: "no orders found" });
            }
            const orders = await Orders.findById(user.userOrders);
            const myOrders = [];
            const myOrderProducts = [];
            orders.orders.forEach( order => {
                order.products.forEach( products => {
                    myOrderProducts.push({
                        productId: products.productId,
                        title: products.title,
                        price: products.price,
                        image: products.image,
                        quantity: products.quantity,
                        totalPrice: `${products.quantity} * ${products.price} = ${products.totalPrice}`                        
                    })
                })
                myOrders.push({
                    orderedProducts: myOrderProducts,
                    orderValue: order.orderValue,
                    numberOfProducts: order.numberOfProducts,
                    orderedOn: order.orderedOn,
                    success: order.success
                })
            })
            res.json(myOrders);
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message});
        }
    }

}