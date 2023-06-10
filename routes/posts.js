const express = require('express');
const postController = require('../controllers/posts');


const router = express.Router();

router.get("/", postController.allPosts);


router.post("/", postController.addPost);
router.get("/:id", postController.getPost);
router.delete("/:id", postController.deletePost);
router.put("/:id", postController.updatePost);

module.exports = router;
