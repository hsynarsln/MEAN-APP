const express = require("express");

//? import our check authentication
const checkAuth = require("../middleware/check-auth");

//? import multer
const extractFile = require("../middleware/file");

//?import posts controller
const PostsController = require("../controllers/posts");

const router = express.Router();

//! POST EKLEMEK İÇİN;
//* FOR USING MULTER --> post fonksiyonu içerisine multer argümanını ekliyoruz.

router.post(
  "", //* path
  checkAuth, //****** İMPORTANT --> PATH'DEN SONRA EKLİYORUZ. BECAUSE DİĞER TÜM İŞLER AUTHENTİCATE OLDUKTAN SONRA
  extractFile,
  PostsController.addPost
);

//! UPDATE

// router.put("/:id", (req, res, next) => {
//   if (!req.body) {
//     return res.status(400).send({ message: "Data to update can not be empty" });
//   }
//   // const post = new Post({
//   //   _id: req.body.id,
//   //   title: req.body.title,
//   //   content: req.body.content,
//   // });
//   Post.findByIdAndUpdate({ _id: req.params.id }, req.body, {
//     useFindAndModify: false,
//   })
//     .then((result) => {
//       res.status(200).json({ message: "Updated Successfully!" });
//     })
//     .catch((err) => {
//       res.status(500).send({ message: "Error Update user information" });
//     });
// });

//* AFTER IMAGE --> WE MODIFY THE UPDATE
router.put(
  "/:id",
  checkAuth, //****** İMPORTANT --> PATH'DEN SONRA EKLİYORUZ. BECAUSE DİĞER TÜM İŞLER AUTHENTİCATE OLDUKTAN SONRA
  extractFile,
  PostsController.updatePost
);

//! POSTLARI ÇAĞIRMAK

router.get("", PostsController.getPosts);

//! UPDATE EDİLECEK OLAN POSTUN SAYFA YENİLENDİĞİNDE BİLGİLERİNİN GİTMEMESİ İÇİN

router.get("/:id", PostsController.getPostWithId);

//! POST DELETE
router.delete("/:id", checkAuth, PostsController.deletePost);

module.exports = router;
