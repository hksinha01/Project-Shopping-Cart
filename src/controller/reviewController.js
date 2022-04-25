const validator = require("../validator/validator")
const reviewModel = require("../models/reviewModel")
const productModel = require("../models/productModel")

const create = async function(req,res){
    try{ 
        const data = req.body
        const product = req.params.productId

        if (!validator.isValidobjectId(product))
            return res.status(400).send({ status: false, msg: "enter valid bookId" })

        if (!validator.isValidReqBody(data))
            return res.status(400).send({ status: false, msg: "please enter valid review details" })

        const { reviewedAt, rating, reviewedBy, productId } = data

        if (!validator.isValidobjectId(productId))
            return res.status(400).send({ status: false, msg: "enter valid bookId" })

        if (product !== productId) {
            return res.status(406).send({ status: false, msg: "please enter same book ID" }) //406 for  not matching
        }
        
        if (!validator.isValid(rating))
            return res.status(400).send({ status: false, msg: "please enter ratings" })

        if (!(rating >= 1 && rating <= 5)) {
            return res.status(400).send({ status: false, msg: " Rating ranges from  1 to 5" })
        }
        if (reviewedBy) {
            if (!isValid(reviewedBy))
                return res.status(400).send({ status: false, msg: "please enter reviewdname" })
        }

        if (!validator.isValid(productId))//add something here
            return res.status(400).send({ status: false, msg: "please enter bookId" })

        const findProduct = await productModel.find({ _id: product, isDeleted: false })    //find by id is not handle isdeleted CASE
        if (!findProduct)
            return res.status(400).send({ status: false, msg: "bookId not found please enter valid bookId" })

       
        const reviewdatails = await reviewModel.create(data)

        const count = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $inc: { reviews: 1 } })//this is good practice
        //{ $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }
        const details = {
            _id: reviewdatails._id,
            productId: reviewdatails.productId,
            reviewedBy: reviewdatails.reviewedBy,         //this way to use create and some usefull data(we can say here we select who data we want)
            reviewedAt: reviewdatails.reviewedAt,
            rating: reviewdatails.rating,
            review: reviewdatails.review

        }

        return res.status(201).send({ status: true, msg: "reviewer created", data: details })

    }

    catch(error){
        console.log(error.message)
        return res.status(500).send({status: false,message:error.message})
    }
}

const deleteReview = async function(req,res){
    try{

        let productId = req.params.productId
        let reviewId = req.params.reviewId

        if (!productId) {
            return res.status(400).send({ status: false, msg: "please enter bookId" })
        }

        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "bookId id is not valid" })
        }

        if (!reviewId) {
            return res.status(400).send({ status: false, msg: "please enter reviewId" })
        }

        if (!validator.isValidobjectId(reviewId)) {
            return res.status(400).send({ status: false, msg: "reviewId in not valid" })
        }

        const findreviewer = await reviewModel.findOneAndUpdate({ _id: reviewId, productId: productId, isDeleted: false }, { isDeleted: true, deletedAt: Date.now(), new: true })
        if (!findreviewer) {
            return res.status(400).send({ status: false, msg: "reviewer not exist's " })
        }

        const updated = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $inc: { reviews: (-1) } })
        return res.status(200).send({ status: true, msg: "successfully deleted" })

    }

    catch(error){
        console.log(error.message)
        return res.status(500).send({status: false,message:error.message})
    }
}


module.exports.create=create
module.exports.deleteReview=deleteReview