const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary')


//CREATE 
module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}
module.exports.createCampground = async (req, res, next) => {

    const camp = new Campground(req.body.campground);
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.author = req.user._id
    await camp.save();
    console.log(camp);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${camp._id}`);
}
//READ
module.exports.showCampground = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!camp) {
        req.flash('error', 'Campground was not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp });
}
//UPDATE
module.exports.renderEditForm = async (req, res, next) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash('error', 'Campground was not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camp })
}
module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...imgs);
    await camp.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });

    }
    req.flash('success', 'Successfully updated the campground!')
    res.redirect(`/campgrounds/${camp._id}`);
}
//DELETE
module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}