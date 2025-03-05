/*********************************************************************************
WEB322 – Assignment 03

I declare that this assignment is my own work.

Name: Raj Maharjan
Student ID: 162680235
Date: march 4,2025
Replit Web App URL: https://a2673d62-a909-4f67-98ae-168a927cbe2c-00-3fx40qplv98o1.spock.repl.co/
GitHub Repository URL: https://github.com/RajMaharjan-fen/web322-app
********************************************************************************/

const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dbd1qlcof',
    api_key: '627917398641178',
    api_secret: 'D1Uqr5jg2f_Hnh3nByoicSqYTSQ',
    secure: true
});

const upload = multer();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const storeService = require('./store-service');

app.get('/', (req, res) => res.redirect('/about'));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views/about.html')));
app.get("/items/add", (req, res) => res.sendFile(path.join(__dirname, 'views/addItem.html')));

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
    let imageUrl = "";

    if (req.file) {
        try {
            const result = await new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
            imageUrl = result.url;
        } catch (err) {
            console.error("Error uploading image:", err);
            return res.status(500).send("Image upload failed");
        }
    }

    req.body.featureImage = imageUrl;

    storeService.addItem(req.body)
        .then(() => res.redirect("/items"))
        .catch(err => res.status(500).send("Error adding item: " + err));
});

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(404).json({ message: err }));
});


app.get("/items", (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then(data => res.json(data))
            .catch(err => res.status(404).send(err));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(data => res.json(data))
            .catch(err => res.status(404).send(err));
    } else {
        storeService.getAllItems()
            .then(items => res.json(items))
            .catch(err => res.status(404).json({ message: err }));
    }
});


app.get("/item/:id", (req, res) => {
    storeService.getItemById(req.params.id)
        .then(data => res.json(data))
        .catch(err => res.status(404).send(err));
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(404).json({ message: err }));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log("Error initializing store service:", err);
    });


