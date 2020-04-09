const Products = require("../models/Products");

module.exports = {

    async getProducts(req,res){
        const queries = { ...req.query }
        try{
            //checking if user has not entered both greater than and smaller than filters
            if((queries.rating_gt && queries.rating_lt) || (queries.price_gt && queries.price_lt)){
                res.status(400).json({Bad_request: "cannot filter both greater than and less than at same time"})
            }
            let products = await Products.find();
            //filtering products by categories
            if(queries.category){
                products = products.filter(product => product.category == queries.category)
            }
            //filtering products by rating less than
            if(queries.rating_lt){
                products = products.filter(product => product.rating <= queries.rating_lt)
            }
            if(queries.rating_gt){
                //filtering products by rating greater than
                products = products.filter(product => product.rating >= queries.rating_gt)
            }
            //filtering products by price less than
            if(queries.price_lt){
                products = products.filter(product => product.price <= queries.price_lt)
            }
            //filtering products by price greater than
            if(queries.price_gt){
                products = products.filter(product => product.price >= queries.price_gt)
            }
            //filtering products by page numbers
            if(queries.page){
                products = products.slice((queries.page - 1)*10, ((queries.page - 1)*10)+10)
            }
            //sending success response
            res.json([{products_counts: products.length},products])
        }
        catch(err){
            console.log(err)
            //sending error response if any
            res.json({Error: err.message})
        }
    },

    async getSearchProducts(req,res){
        const keyWord = req.query.q;
        
        try{
            //finding all products
            const allproducts = await Products.find();
            //custom func to search in title, category and description
            const search = (text) => allproducts.filter(product => (product.title.toLowerCase().includes(text.toLowerCase())
                || product.category.toLowerCase().includes(text.toLowerCase())
                || product.description.toLowerCase().includes(text.toLowerCase())));
            //searching mathching keyword 
            let products = search(keyWord);
            //checking if any relevant products are found
            if (products.length == 0) return res.status(404).json({ Error: `no product matching '${keyWord}' found` });
            //check if page number given
            if(req.query.page){
                products = products.slice((req.query.page - 1)*10, ((req.query.page - 1)*10)+10)
            }
            //sending success response
            res.json([{products_counts: products.length},products])
        }
        catch(err){
            console.log(err)
            //sending error response if any
            res.json({Error: err.message})
        }
    }
}