const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsynch = require('../utils/wrapAsync');


const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')

const reviews = require('../controllers/reviews.js')



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//NESTED ROUTE CREATING REVIEWS
router.post('/', isLoggedIn, validateReview, wrapAsynch(reviews.createReview))
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//NESTED ROUTE DELETING REVIEWS
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsynch(reviews.deleteReview))

module.exports = router;