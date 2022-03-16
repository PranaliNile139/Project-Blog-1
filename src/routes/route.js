const express = require('express');
const router = express.Router();

const authorController= require("../controllers/authorController")
const blogController= require("../controllers/blogController")
const auth = require("../middleware/auth")

// Phase 1
router.post("/authors", authorController.createAuthor)

// router.post("/blogs", blogController.createBlog)

// router.get("/blogs", blogController.getBlogs)

// router.put("/blogs/:blogId", blogController.updateBlog)

// router.delete("/blogs/:blogId", blogController.deleteBlog)

// router.delete("/blogs", blogController.deleteBlogQuery)


// Phase 2
router.post("/login", authorController.loginAuthor)

router.post("/blogs", auth.authenticate, blogController.createBlog)

router.get("/blogs", auth.authenticate, blogController.getBlogs)

router.put("/blogs/:blogId", auth.authenticate,auth.authorise, blogController.updateBlog)

router.delete("/blogs/:blogId", auth.authenticate, auth.authorise, blogController.deleteBlog)

router.delete("/blogs", auth.authenticate, blogController.deleteBlogQuery)

module.exports = router;