const express = require('express');
const router = express.Router();
const wrapAsynch = require('../utils/wrapAsync');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campground');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

//CREATE ROUTE
router.get('/', wrapAsynch(campgrounds.index));
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
router.post('/', isLoggedIn, upload.array('image'), validateCampground, wrapAsynch(campgrounds.createCampground));

//READ ROUTE
router.get('/:id', wrapAsynch(campgrounds.showCampground));

//UPDATE ROUTE
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsynch(campgrounds.renderEditForm));
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapAsynch(campgrounds.editCampground));

//DELETE ROUTE
router.delete('/:id', isLoggedIn, isAuthor, wrapAsynch(campgrounds.deleteCampground));
module.exports = router;