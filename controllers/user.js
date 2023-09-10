const User = require('../models/user')

//REGISTER
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}
module.exports.createUser = async (req, res) => {
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
}
//LOGIN
module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}
module.exports.Login = async (req, res) => {
    req.flash('success', "Welcome Back!");
    if (res.locals.returnTo) {
        const redirectUrl = res.locals.returnTo;
        res.redirect(redirectUrl);
    }
    else {
        res.redirect('/campgrounds');
    }

}
//LOGOUT
module.exports.Logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
    })
    req.flash('success', 'Successfully logged out')
    res.redirect('/campgrounds')
}