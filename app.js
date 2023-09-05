const express = require('express');
const app = express();
const path = require('path');                                        // require path for ejs
const Campground = require('./models/campground');                   // get Campground model/object from 
const ejsMate = require('ejs-mate');
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
app.get('/campgrounds', wrapAsynch(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}));
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});
app.post('/campgrounds', wrapAsynch(async (req, res, next) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//READ ROUTE
app.get('/campgrounds/:id', wrapAsynch(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { camp });
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//UPDATE ROUTE
app.get('/campgrounds/:id/edit', wrapAsynch(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { camp })
}));
app.put('/campgrounds/:id', wrapAsynch(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${camp._id}`);
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETE ROUTE
app.delete('/campgrounds/:id', wrapAsynch(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ERROR HANDLER
app.use((err, req, res, next) => {
    res.send("oh boy something went wrong")
})
app.listen(3000, (req, res) => {
    console.log("listening on port 3000");

});