const express = require('express');
const app = express();
const path = require('path')                                        // require path for ejs
const Campground = require('../models/campground')                   // get Campground model/object from 
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
// connect to mongoose
const mongoose = require('mongoose');
//const campground = require('./models/campground');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// check if data base is connected
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

// create unique title for campgrounds
const uniqueTitle = () => {
    const place = places[Math.floor(Math.random() * places.length)];
    const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
    return place + descriptor;
}

// create new campgrounds
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            title: uniqueTitle(),
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})
