//? password'u encrypted olarak tutmak maksadıyla "npm i --save bcryptjs" install ediyoruz
const bcrypt = require("bcryptjs");
//? webtoken import ediyoruz
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
  //* app.js dosyasında api/user olarak path'i tanımladık. burada api/user/signup oluyor.
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    //? MONGODB
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid authentication credentials!",
        });
      });
  });
};

exports.userLogin = (req, res, next) => {
  let fetchedUser; //? bunu yapmadığımızda user ikinci then bloğuna geçmiyor.
  //* email exist?
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      fetchedUser = user; //? bunu yapmadığımızda user ikinci then bloğuna geçmiyor.
      //? else encrypted olarak database'deki user password ile karşılaştırmamız lazım. So bycrpt'in bize sağladığı compare() fonksiyonunu kullanıyoruz.
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        //? --> because boolean olabilir
        res.status(401).json({
          //? return --> hata olursa kodun devamını execute etmeyi önlüyor
          message: "Auth failed",
        });
      }
      //* this method creates a new token based on some input data of your choice
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY, //? ana iskelette oluşturduğumuz nodemon.json dosyasından çekiyoruz. ilave olarak import etmeye gerek yok
        { expiresIn: "1h" } //? token 1 saat sonra yok olacak
      );
      //? if token create succesfully
      res.status(200).json({
        token: token, //?? burada token'ı response olarak frontend'teki auth.service.ts 'e gönderiyoruz.
        expiresIn: 3600,
        userId: fetchedUser._id,
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Invalid authentication credentials!",
      });
    });
};
