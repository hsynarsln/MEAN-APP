//! CHECKS WE ARE AUTHENTICATION OR NOT

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; //* authorization --> for attaching authorization information for a request
    const decodedToken = jwt.verify(token, process.env.JWT_KEY); //? verify --> will also throw an error if it fails to verify

    //? for authorization --> so we can add routes/posts.js new post user data
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };

    next(); //* let the execution continue
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated!" });
  }
};
