const express = require('express');
const router = express.Router();

const passport = require('passport')
const wrapAsynch = require('../utils//wrapAsync');
const { storeReturnTo } = require('../middleware')
const users = require('../controllers/user')


//CREATE
router.get('/register', users.renderRegister)
router.post('/register', wrapAsynch(users.createUser))
//LOGIN
router.get('/login', users.renderLogin)
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), wrapAsynch(users.Login))
//LOGOUT
router.get('/logout', users.Logout)
module.exports = router; 