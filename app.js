if (process.env.NODE_ENV !== "prodcution") {
    require('dotenv').config();
}
const express = require('express');
const app = express();
//MODELS
const Review = require('./models/review')                            // get Review model/object from review.js
const Campground = require('./models/campground');                   // get Campground model/object from campground.js
const User = require('./models/user');

//JOI
const joi = require('joi')
//SESSION
const session = require('express-session')
const flash = require('connect-flash')
//UTILITIES
const expressError = require('./utils/expressError');
//REQUIRE ROUTES
const userRoutes = require('./routes/user')
const campgroundsRoutes = require('./routes/campground');
const reviewsRoutes = require('./routes/review');
///////////////////////////////////////////////////////////////////////////
// connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});
///////////////////////////////////////////////////////////////////////////
// set the view engine to ejs
const path = require('path');                                        // require path for ejs
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//Session
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

//PASSPORT
const passport = require('passport');
const localStrategy = require('passport-local');
app.use(passport.initialize());
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})



//methodOverride required for put/patch/delete
const methodOverride = require('method-override');
app.use(methodOverride('_method'))
//parse req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'afnan.ebrahim214@gmail.com', username: 'afnan_ebra' })
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})
app.use('/', userRoutes)
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes)



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