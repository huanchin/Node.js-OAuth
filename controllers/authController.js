const User = require("./../models/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.protect = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/auth/login");
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      req.flash("error_msg", "Email has already been registered");
      res.redirect("/auth/signup");
    }

    const hash = await bcrypt.hash(password, saltRounds);
    const hashedPassword = hash;
    await User.create({ name, email, password: hashedPassword });
    req.flash("success_msg", "Registeration succeeds. You can login now.");
    res.redirect("/auth/login");
  } catch (err) {
    req.flash("error_msg", err.errors.name.properties.message);
    res.redirect("/auth/signup");
  }
};
