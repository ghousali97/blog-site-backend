const db = require("../db");
const { use } = require("../routes/posts");
const passwordUtils = require('../utils/password-utils')
const moment = require('moment');


function allPosts(req, res) {
    const category = req.query.cat;
    var all_q = category ? "SELECT * FROM posts WHERE cat=?" : "SELECT * FROM posts"
    db.query(all_q, [category], (err, data) => {
        if (err) return res.status(500).json({ error: true, message: "Internal server error!" });
        res.send(data);
    });
}

function addPost(req, res) {

    const title = req.body.title;
    const desc = req.body.desc;
    const cat = req.body.cat;
    const img = req.body.img;
    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    const token = req.header("x-auth-token");

    console.log("Token:" + token);
    if (!token) return res.status(401).json({ error: true, message: "Unauthorised!" });
    try {
        var payload = passwordUtils.verifyJwt(token);
        var userId = payload.sub;
        console.log("User:" + userId);
        insert_q = "INSERT INTO posts (title, `desc`,img,date,uid,cat) VALUES(?,?,?,?,?,?)";

        db.query(insert_q, [title, desc, img, date, userId, cat], (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: true, message: "Internal server error!" });
            } return res.status(201).json({ postId: data.insertId });
        });

    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: true, message: "Unauthorised!" });

    }

}


function getPost(req, res) {
    const postId = req.params.id;
    search_q = "SELECT p.id,username,title, `desc`, p.img ,date,cat, u.img AS userImg FROM users u JOIN posts p ON u.id = p.uid where p.id=?";
    db.query(search_q, [postId], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: true, message: "Internal server error!" });
        }
        console.log(data.length);
        if (data.length > 0) return res.json(data[0]);
        return res.status(404).json({ error: true, message: "Post not found!" });

    });

}

function deletePost(req, res) {

    const postId = req.params.id;
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ error: true, message: "Unauthorised!" });
    try {
        var payload = passwordUtils.verifyJwt(token);
        var userId = payload.sub;

        delete_q = "DELETE FROM posts where id=? AND uid=? ";
        db.query(delete_q, [postId, userId], (err, data) => {
            if (err) return res.status(500).json({ error: true, message: "Internal server error!" });
            if (data.affectedRows === 0) return res.status(404).json({ error: true, message: "Post doesn't exist" });
            res.status(204).json();
        });

    } catch (err) {
        return res.status(401).json({ error: true, message: "Unauthorised!" });

    }




}
function updatePost(req, res) {

    const postId = req.params.id;
    const title = req.body.title;
    const desc = req.body.desc;
    const cat = req.body.cat;
    const img = req.body.img;

    console.log('Updateing post:' + postId);
    const token = req.header("x-auth-token");

    if (!token) return res.status(401).json({ error: true, message: "Unauthorised!" });
    try {
        var payload = passwordUtils.verifyJwt(token);
        var userId = payload.sub;
        update_q = "UPDATE posts SET `title`=?,`desc`=?,`img`=?,`cat`=? WHERE `id` = ? AND `uid` = ?";

        db.query(update_q, [title, desc, img, cat, postId, userId], (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: true, message: "Internal server error!" });
            } return res.status(201).json({ postId: data.insertId });
        });

    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: true, message: "Unauthorised!" });

    }

}

module.exports = {
    allPosts, addPost, getPost, deletePost, updatePost
};

