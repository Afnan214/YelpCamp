const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport')
const wrapAsynch = require('../utils//wrapAsync');
const { storeReturnTo } = require('../middleware')

router.get('/register', (req, res) => {
    res.render('users/register')
})
router.post('/register', wrapAsynch(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email: email, username: username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/campgrounds');

        });

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}))
router.get('/login', (req, res) => {
    res.render('users/login')
})
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    req.flash('success', "Welcome Back!");
    if (res.locals.returnTo) {
        const redirectUrl = res.locals.returnTo;
        res.redirect(redirectUrl);
    }
    else {
        res.redirect('/campgrounds');
    }

})
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
    })
    req.flash('success', 'Successfully logged out')
    res.redirect('/campgrounds')
})
module.exports = router; 