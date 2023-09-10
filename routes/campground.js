const express = require('express');
const router = express.Router();
const wrapAsynch = require('../utils/wrapAsync');
const expressError = require('../utils/expressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//CREATE ROUTE
router.get('/', wrapAsynch(async (req, res, next) => {
    const campgrounds = await Campground.find({})

    res.render('campgrounds/index', { campgrounds })
}));
router.get('/new', isLoggedIn, (req, res) => {

    res.render('campgrounds/new');
});
router.post('/', isLoggedIn, validateCampground, wrapAsynch(async (req, res, next) => {

    const camp = new Campground(req.body.campground);
    camp.author = req.user._id
    await camp.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${camp._id}`);
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//READ ROUTE
router.get('/:id', wrapAsynch(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!camp) {
        req.flash('error', 'Campground was not found')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp });
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//UPDATE ROUTE
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsynch(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash('error', 'Campground was not found')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camp })
}));
router.put('/:id', isLoggedIn, isAuthor, validateCampground, wrapAsynch(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);

    camp.updateOne(...req.body.campground);
    await camp.save()
    req.flash('success', 'Successfully updated the campground!')
    res.redirect(`/campgrounds/${camp._id}`);
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETE ROUTE
router.delete('/:id', isLoggedIn, isAuthor, wrapAsynch(async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}));
module.exports = router;