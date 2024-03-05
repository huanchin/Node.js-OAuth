const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [255, "A name must have less or equal then 40 characters"], // built-in validator
    minlength: [6, "A name must have more or equal then 6 characters"], // built-in validator
  },
  googleID: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  thumbnail: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    minlength: [8, "A password must have more or equal then 8 characters"],
    select: false,
  },
});

// userSchema.pre("save", async function (next) {
//   // only run this function if password is actually modified
//   // 沒有更新則跳至下一個 middleware
//   if (!this.isModified("password")) return next();

//   // 如果有 modified password...
//   // 把登入時候使用者傳進來的 password 加密後存於 password property
//   // bcrypt: hash the password with cost of 12
//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
//   next();
// });

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  const result = await bcrypt.compare(candidatePassword, userPassword);
  // console.log(result);
  return result;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
