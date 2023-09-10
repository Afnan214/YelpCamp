const express = require('express');
const router = express.Router({ mergeParams: true });

const { reviewSchema } = require('../schemas.js')

const Campground = require('../models/campground');
const Review = require('../models/review')

const wrapAsynch = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');

const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//NESTED ROUTE CREATING REVIEWS
router.post('/', isLoggedIn, validateReview, wrapAsynch(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id
    campground.reviews.push(review);

    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//NESTED ROUTE DELETING REVIEWS
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsynch(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the comment')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;