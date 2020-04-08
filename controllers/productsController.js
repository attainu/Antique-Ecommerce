const Products = require("../models/Products");

module.exports = {

    async getProducts(req,res){
        const queries = { ...req.query }
        try{
            if((queries.rating_gt && queries.rating_lt) || (queries.price_gt && queries.price_lt)){
                res.status(400).json({Bad_request: "cannot filter both greater than and less than at same time"})
            }
            let products = await Products.find();
            if(queries.category){
                products = products.filter(product => product.category == queries.category)
            }
            if(queries.rating_lt){
                products = products.filter(product => product.rating <= queries.rating_lt)
            }
            if(queries.rating_gt){
                products = products.filter(product => product.rating >= queries.rating_gt)
            }
            if(queries.price_lt){
                products = products.filter(product => product.price <= queries.price_lt)
            }
            if(queries.price_gt){
                products = products.filter(product => product.price >= queries.price_gt)
            }
            if(queries.page){
                products = products.slice((queries.page - 1)*10, ((queries.page - 1)*10)+10)
            }
            res.json([{products_counts: products.length},products])
        }
        catch(err){
            console.log(err)
            res.json({Error: err.message})
        }
    },

    async getSearchProducts(req,res){
        const keyWord = req.query.q;
        
        try{

            const allproducts = await Products.find();

            const search = (text) => allproducts.filter(product => (product.title.toLowerCase().includes(text.toLowerCase())
                || product.category.toLowerCase().includes(text.toLowerCase())
                || product.description.toLowerCase().includes(text.toLowerCase())));

            let products = search(keyWord);

                if(req.query.page){
                    products = products.slice((req.query.page - 1)*10, ((req.query.page - 1)*10)+10)
                }
            
            res.json([{products_counts: products.length},products])
        }
        catch(err){
            console.log(err)
        }
    }
}