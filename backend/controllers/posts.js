const Post = require("../models/post");

exports.addPost = (req, res, next) => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const url = req.protocol + "://" + req.get("host"); //? image için oluşturduk. '://' --> get full url  & req.get("host") --> get current host
  // const post = req.body;
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename, //? we will configure this folder to be accessible directly after our domain
    //? for authorization wee keep userId as part of our post
    creator: req.userData.userId, //? string --> objectId by mongoose
  });
  // console.log(post);

  // post.save(); //? MONGODB POST METHOD
  // res.status(201).json({
  //   message: "Post added succesfully",
  // });

  //? ID HATASINI GİDERMEK İÇİN YUKARIDAKİ KODU MODİFİYE EDİYORUZ.
  post
    .save()
    .then((createdPost) => {
      // console.log(createdPost);
      res.status(201).json({
        message: "Post added succesfully",
        // postId: createdPost._id,
        //? image'den sonra değiştirdik
        post: {
          ...createdPost,
          id: createdPost._id, //? we want to remap that ID --> bunun için alttaki parametreleri comment yapıyoruz ve yukarıda spread operatörünü kullanıyoruz. Müteakiben service.ts'de postID kısmını değiştiriyoruz.
          // title: createdPost.title,
          // content: createdPost.content,
          // imagePath: createdPost.imagePath,
        },
      });
    })
    .catch((errpr) => {
      res.status(500).json({
        message: "Creating a post failed!",
      });
    });
};

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.body) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    //? for auth
    creator: req.userData.userId,
  });
  // console.log(post);
  // Post.updateOne({ _id: req.params.id }, post).then((result) => {
  //   res.status(200).json({ message: "Updated Successfully!" });
  // });

  //? for authorization (edit --> sadece o postu create eden userId tarafından yapmasını istiyoruz.)
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
    .then((result) => {
      // console.log(result);
      if (result.matchedCount > 0) {
        res.status(200).json({ message: "Updated Successfully!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't update post!",
      });
    });
  //? ----------- then we go to the front-end
};

exports.getPosts = (req, res, next) => {
  //? 3000/posts
  // res.send("Hello from express!");
  // const posts = [
  //   {
  //     id: "fds4df2s4df5",
  //     title: "First server-side post",
  //     content: "This is coming from the server",
  //   },
  //   {
  //     id: "hfg5h4f5g4h6",
  //     title: "Second server-side post",
  //     content: "This is coming from the server",
  //   },
  // ];

  // res.status(200).json({
  //   message: "Post fetched succesfully!",
  //   posts: posts,
  // });

  //? MONGODB SONRASI COMPILE ETTİK.
  // Post.find().then((documents) => {
  //   res.status(200).json({
  //     message: "Post fetched succesfully!",
  //     posts: documents,
  //   });
  // });

  //? IMPLEMENTING PAGINATOR
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    //? skip() --> we will not retrieve all elements we find, not all posts but we will skip the first n posts
    //? limit() --> the amounts at documents we return
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Post fetched succesfully!",
        posts: fetchedPosts,
        maxPosts: count,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching posts failed!",
      });
    });
};

exports.getPostWithId = (req, res, next) => {
  Post.findById(req.params.id)
    .then((post) => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching posts failed!",
      });
    });
};

exports.deletePost = (req, res, next) => {
  // console.log(req.params.id);
  // Post.deleteOne({ _id: req.params.id }).then((result) => {
  //   console.log(result);
  //   res.status(200).json({ message: "Post deleted!" });
  // });

  //? for authorization (delete --> sadece o postu create eden userId tarafından yapmasını istiyoruz.)
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      console.log(result);
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Deleted Successfully!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching posts failed!",
      });
    });
  //? then we need to pass userId to frontend
};
