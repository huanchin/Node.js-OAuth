const express = require("express");
const router = express.Router();
const { protect } = require("./../controllers/authController");

router.get("/", protect, (req, res) => {
  res.render("profile", { user: req.user });
});

module.exports = router;
