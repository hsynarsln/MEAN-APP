const mongoose = require("mongoose");
//? mükerrer email kaydını önlemek için --> npm i --save mongoose-unique-validator --> then;
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, //? unique: true --> it's not a validator. this means it does not automatşically throw error. if we try to add a new entry with an email adress taht does not already exist, it will eventually lead to problems but we cant rely on this validating data when we try to save it. Also allows us mongoose and mongodb to do some internall optimizations from a performance perspective
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); //*we validate this and we will get an error if we try to save a user with an e-mail that does not exist

module.exports = mongoose.model("User", userSchema);
