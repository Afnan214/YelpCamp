if (process.env.NODE_ENV !== "prodcution") {
    require('dotenv').config();
}



const express = require('express');
const app = express();
//MODELS
const Review = require('./models/review')                            // get Review model/object from review.js
const Campground = require('./models/campground');                   // get Campground model/object from campground.js
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize')
//HELMET
const helmet= require('helmet')
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
const mongoose = require('mongoose');

const MongoStore = require('connect-mongo');

///////////////////////////////////////////////////////////////////////////
// connection
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl,{
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
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
store.on("error", function(e){
    console.log("Session Store Error", e)
})
//Session
const sessionConfig = {
    store,
    name : 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(mongoSanitize());
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dztcgrrzg/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

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

app.get('/', (req, res) =>{
    res.render('home')
})

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