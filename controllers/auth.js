
const passwordUtils = require('../utils/password-utils');
const db = require("../db");
const cookieParser = require('cookie-parser')

function register(req, res) {
    const username = req.body.username;
    const email = req.body.username;
    const password = req.body.password;
    const saltHash = passwordUtils.generatePassword(password);


    const search_q = "SELECT * FROM users where email = ? or username=?";


    db.query(search_q, [email, username], (err, data) => {
        if (err) return res.status(500).json({ error: true, message: "Internal server error!" });
        if (data.length) {
            return res.status(409).json({ error: true, message: "username / email already exists!" });
        }

        const insert_q = "INSERT INTO users (username,email,password,salt) VALUES (?,?,?,?)";
        db.query(insert_q, [username, email, saltHash.hash, saltHash.salt], (err, data) => {
            if (err) return res.status(500).json({ error: true, message: "Internal server error!" });
            console.log(data);
            return res.json(data);
        });

    });




}



function login(req, res) {
    const usernameOrEmail = req.body.username;
    const password = req.body.password;

    if (!usernameOrEmail || !password) return res.status(400).json({ error: true, message: "Please provide username and password!" });

    username_q = "SELECT * FROM users where email=? or username=? LIMIT 1";
    db.query(username_q, [usernameOrEmail, usernameOrEmail], (err, data) => {
        if (err) return res.status(500).json({ error: true, message: "Internal server error!" });
        if (data.length) {

            if (passwordUtils.validatePassword(password, data[0].password, data[0].salt)) {
                const jwtToken = passwordUtils.issueJwt(data[0]);
                res.cookie('jwt', jwtToken.token, { expire: jwtToken.expires, httpOnly: true, sameSite: 'None' }).json({ username: data[0].username, img: data[0].img, accessToken: jwtToken.token, expires: jwtToken.expires });
            } else {
                return res.status(401).json({ error: true, message: "Invalid password!" });
            }

        } else {
            return res.status(401).json({ error: true, message: "Invalid email / username" });

        }

    });
}

function verifyToken(req, res) {
    const token = req.header("x-auth-token");
    console.log('verify method called!');

    if (!token) return res.status(401).json({ error: true, message: "Unauthorised!" });
    try {
        var payload = passwordUtils.verifyJwt(token);
        var userId = payload.sub;
        res.status(200).json({ error: false, message: "Still alive" })
    }
    catch (err) {
        console.log(err);
        return res.status(401).json({ error: true, message: "Unauthorised!" });

    }
}

function logout(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    res.json([username, password]);
}

module.exports = {
    register, login, logout, verifyToken
};