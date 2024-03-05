const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const User = require("./../models/userModel");

//6) create a cookie using usre._id
passport.serializeUser((user, done) => {
  console.log("serializing ...");
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
  console.log("deserializing ...");
  const user = await User.findById({ _id });
  if (!user) return done(null, false);
  done(null, user);
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // console.log(username, password, done);
      const user = await User.findOne({ email: username }).select("+password");
      // console.log(user);
      if (!user) return done(null, false);
      const result = await user.correctPassword(password, user.password);
      if (!result) return done(null, false);
      done(null, user);
    } catch (err) {
      return done(null, false);
    }
  })
);

passport.use(
  //0) Setup options for the google strategy
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    //5) this passport callback function fire once the profile info is received
    // look up/ create user in our DB
    // check if user exist. if yes, get user info from DB. if no, create user base on this profile info
    async (req, accessToken, refreshToken, profile, done) => {
      // console.log(profile);
      const user = await User.findOne({ googleID: profile.id });
      // console.log(user);
      // go to 6) serializer
      if (user) return done(null, user);

      const newUser = await User.create({
        name: profile.displayName,
        googleID: profile.id,
        thumbnail: profile.photos[0].value,
        email: profile.emails[0].value,
      });
      // console.log(newUser);
      // go to 6) serializer
      done(null, newUser);
    }
  )
);
