const express = require("express");

//?sonradan oluşturduğumuz controller dosyasını import ediyoruz
const UserController = require("../controllers/user");

const router = express.Router();

router.post("/signup", UserController.createUser);

//? FOR AUTHENTICATION WE NEED TO CREATE A FITTING ROUTE, THUS FAR, WE ONLY GOR A ROUTE WHICH ALLOWS US TO CREATE A NEW USER
//* FOR LOGIN CREATE A TOKEN
router.post("/login", UserController.userLogin);

module.exports = router;
