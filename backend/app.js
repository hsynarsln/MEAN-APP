const path = require("path"); //? this allows us to construct paths in away that's safe to run on any operating system (images için ekledik)
const express = require("express");
const bodyParser = require("body-parser");
//? MONGODB IMPORT
const mongoose = require("mongoose");
//? ROUTER'DAKİ FONKSİYONLARI IMPORT
const postsRoutes = require("./routes/posts");
//! AUTHENTICATION İÇİN ROUTE OLUŞTURUYORUZ & (!!sayfanın altında app.use yapıyoruz)
const userRoutes = require("./routes/user");

const app = express();

//? mongoose connect
mongoose
  .connect(
    "mongodb+srv://admin:" +
      process.env.MONGO_ATLAS_PW +
      "@cluster0.usxk5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB connection succesfull!");
  })
  .catch(() => {
    console.log("DB connection failed!");
  });

app.use(bodyParser.json()); //? only works for JSON or URL encoded data but not for files
app.use(bodyParser.urlencoded({ extended: false })); //? only works for JSON or URL encoded data but not for files
//* work for files --> npm i --save multer
app.use("/images", express.static(path.join("backend/images"))); //? static()--> means any requests targeting/images will be allowed to continue and fetch their files from there. And also "/images" --> path'i actually incorrect, so fix this we use "path" require. so requests going to images are actually forwarded backend images.

//? CORS HATASINI GİDERMEK İÇİN
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    // "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
