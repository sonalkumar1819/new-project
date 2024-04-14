const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
app.use(express.static("style"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const url = 'mongodb://localhost:27017';

const dbName = 'feedbackDB';
const client = new MongoClient(url);
let db, feedbackCollection;
client.connect().then(() => {
    console.log('Connected to MongoDB server');
    db = client.db(dbName);
    feedbackCollection = db.collection('feedback');
}).catch((err) => {
    console.error('Failed to connect to MongoDB server:', err);
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'/index.html'));
});
app.post("/", async function (req, res) {
    const { message, nameofperson, username } = req.body;
    const feedbackData = {
        name: nameofperson,
        email: username,
        message: message,
        date: new Date()
    };
    try {
        await feedbackCollection.insertOne(feedbackData);
        console.log('Data inserted into MongoDB');
    } catch (error) {
        console.error('Failed to insert data into MongoDB:', error);
        return res.status(500).send('Error inserting data');
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sonaljha9142@gmail.com',
            pass: 'trve xkbp vlnh ewjg'
        }
    });

    const mailOptions = {
        from: 'sonaljha9142@gmail.com',
        to: req.body.username,
        cc: 'sonaljha9142@gmail.com',
        subject: `Thanks for visiting my website and giving me feedback, ${nameofperson}`,
        text: `Thanks for your message: ${message}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/');
            console.log('Email sent: ' + info.response);
        }
    });
});
const port = 2005; 

app.listen(port, function () {
    console.log(`Server started at port ${port}`);
});
