const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

// const cookieSession = require("cookie-session");
const passport = require("passport");
// 3) run Google Strategy setup in config file
const passportSetup = require("./config/passport");

const app = express();

dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 3000;
const Database = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(Database, {
    // useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => {
    console.log("💥ERROR", err);
    console.log("Database connected fail!");
  });

app.set("view engine", "ejs");

// express.json() is a body parser for post request except html post form
// express.urlencoded({extended: false}) is a body parser for html post form

// parse application/json, basically parse incoming Request Object as a JSON Object
app.use(express.json({ limit: "10kb" }));
// parse application/x-www-form-urlencoded, basically can only parse incoming Request Object if strings or arrays
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// send out cookie
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    maxAge: 5 * 60 * 1000, // miliseconds
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error"); // passport專用
  next();
});
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`App running on port ${port}`);
});
