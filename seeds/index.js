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
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const cprice = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            title: uniqueTitle(),
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude,
                cities[random1000].latitude]
            },
            images: [{
                url: 'https://res.cloudinary.com/dztcgrrzg/image/upload/v1694407271/YelpCamp/n5llpz9lhjo95igq5ara.jpg',
                filename: 'YelpCamp/n5llpz9lhjo95igq5ara',
            },
            {
                url: 'https://res.cloudinary.com/dztcgrrzg/image/upload/v1694407271/YelpCamp/ptl7k5flwdc4ofqrbb2y.jpg',
                filename: 'YelpCamp/ptl7k5flwdc4ofqrbb2y',
            }],
            price: cprice,
            author: '64fcc5e716baadab8714c0fa',
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus est atque ab, hic esse nam numquam reprehenderit labore harum id aperiam sint? Animi quos accusantium voluptatibus inventore tenetur quasi fugiat! Voluptatibus doloremque itaque excepturi natus temporibus blanditiis sequi beatae quae! Alias ipsam eaque nam est.Optio dolore necessitatibus accusantium distinctio explicabo iste, odio rerum veritatis iusto minima asperiores, rem eaque."
        })
        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})
