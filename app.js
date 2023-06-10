const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const portNumber = process.env.PORT || 4000;
const db = require("./db");
const postRoutes = require("./routes/posts");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
});

const upload = multer({ storage: storage });

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);


app.listen(portNumber, () => {
    console.log("Server started on: " + portNumber);
});


app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log(req);
    res.status(200).json({ imgUrl: req.file?.filename || "" });
});
app.get("/", (req, res) => {

    res.send("hello world!");
})
