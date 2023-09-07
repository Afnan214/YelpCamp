const express = require('express');
const app = express();
const path = require('path');                                        // require path for ejs
///////////////////////////////////////////////////////////
//MODELS
const Review = require('./models/review')                            // get Review model/object from review.js
const Campground = require('./models/campground');                   // get Campground model/object from campground.js
const ejsMate = require('ejs-mate');
//JOI
const joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas')
//UTILITIES
const expressError = require('./utils/expressError');
const wrapAsynch = require('./utils/wrapAsync');
//methodOverride required for put/patch/delete
const methodOverride = require('method-override');
// connect to mongoose
const mongoose = require('mongoose');
//const campground = require('./models/campground');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.engine('ejs', ejsMate);
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));


const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new expressError(msg, 400);
    }
    else { next(); }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new expressError(msg, 400);
    }
    else { next(); }
}



// check if data base is connected
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//CREATE ROUTE 
app.get('/campgrounds', wrapAsynch(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}));
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});
app.post('/campgrounds', validateCampground, wrapAsynch(async (req, res, next) => {

    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//READ ROUTE
app.get('/campgrounds/:id', wrapAsynch(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate('reviews');

    res.render('campgrounds/show', { camp });
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//UPDATE ROUTE
app.get('/campgrounds/:id/edit', wrapAsynch(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { camp })
}));
app.put('/campgrounds/:id', validateCampground, wrapAsynch(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${camp._id}`);
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETE ROUTE
app.delete('/campgrounds/:id', wrapAsynch(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);

    res.redirect('/campgrounds');
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//NESTED ROUTE CREATING REVIEWS
app.post('/campgrounds/:id/reviews', validateReview, wrapAsynch(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//NESTED ROUTE DELETING REVIEWS
app.delete('/campgrounds/:id/reviews/:reviewId', wrapAsynch(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ERROR HANDLER
app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong';
    res.status(status).render('error', { err });

})
app.listen(3000, (req, res) => {
    console.log("listening on port 3000");

});