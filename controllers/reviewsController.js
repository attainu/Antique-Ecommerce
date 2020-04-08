const Users = require("../models/User");
const Products = require("../models/Products");
const Reviews = require("../models/Reviews")

module.exports = {

    async addReview(req,res){
        const userId = req.session.userId;
        const productId = req.query.pr;
        const rating = Number(req.body.rating.toFixed(1));
        const review = req.body.review || "";

        try{
            if (!rating || rating < 1 || rating > 5){
                return res.status(400).json({ Error: "incorrect rating" })
            }
            const products = await Products.findById(productId);
            if(!products){
                return res.status(400).json({ Error: "invalid product_id" })
            }
            const user = await Users.findById(userId);
            let reviews = await Reviews.findOne({ productId: productId });
            if (!reviews){
                const averageRating = ((products.rating + rating) / 2).toFixed(1);
                reviews = await Reviews.create({ productId: productId,
                    title: products.title,
                    price: products.price,
                    image: productId.image, 
                    averageRating: averageRating,
                    reviews: [{ 
                        userId: userId,
                        name: user.name,
                        email: user.email, 
                        rating: rating, 
                        review: review }] 
                });
                user.reviewedProducts.push(reviews._id);
                products.rating = averageRating;
                await user.save();
                await products.save();
            }else {
                let alreadyReviewed = false;
                let totalRating = 0;
                let totalReviews = 0;
                reviews.reviews.forEach(eachreview => {
                    if (eachreview.userId == userId){
                        eachreview.rating = rating;
                        eachreview.review = review;
                        alreadyReviewed = true;
                    }
                    totalRating = Number(totalRating) + Number(eachreview.rating);
                    totalReviews = totalReviews + 1;
                })
                if (!alreadyReviewed){
                    reviews.reviews.push({ 
                        userId: userId,
                        name: user.name,
                        email: user.email, 
                        rating: rating, 
                        review: review 
                    });
                    totalRating = Number(totalRating) + Number(rating);
                    totalReviews = totalReviews + 1;
                }
                const averageRating = ((products.rating + (totalRating / totalReviews)) / 2).toFixed(1);
                reviews.averageRating = averageRating
                await reviews.save();
                products.rating = averageRating;
                await products.save();
                res.json({ review_added_successfully: true});
            }
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message});
        }
    },

    async getReviews(req,res){
        const productId = req.query.pr; 
        try{
            const review = await Reviews.findOne({ productId: productId });
            if (!review){
                res.status(400).json({ Error: "no reviews found for this product" })
            }
            const reviews = [];
            review.reviews.forEach(eachreview => {
                reviews.push({ 
                    name: eachreview.name, 
                    email: eachreview.email, 
                    rating: eachreview.rating, 
                    review: eachreview.review 
                })
            })
            res.json({
                title: review.title,
                price: review.price,
                image: review.image,
                averageRating: review.averageRating,
                reviews: reviews
            });
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message});
        }
    },

    async myReviews(req,res){
        const userId = req.session.userId;
        try{
            const user = await Users.findById(userId);
            if (!user.reviewedProducts){
                res.status(404).json({ Error: "you didn't gave any reviews yet"});
            }
            const userReviews = [];
            for( eachreview of user.reviewedProducts){
                const review = await Reviews.findById(eachreview);
                review.reviews.forEach( object => {
                    if (object.userId == userId){
                        userReviews.push({
                            title: review.title,
                            price: review.price,
                            image: review.image,
                            averageRating: review.averageRating,
                            myRating: object.rating,
                            myReview: object.review
                        })
                    }
                })
            }
            res.json(userReviews);
        }
        catch(err){
            console.log(err);
            res.json({Error: err.message});
        }
    }
}