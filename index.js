const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('services'));
app.use(express.static('feedbacks'));


app.use(fileUpload());
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ydglb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("creativeAgency").collection("creativeAgency79");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const newServiceCollection = client.db("creativeAgency").collection("newServices");

  // user buying services 


  app.post('/userService', (req, res) => {
    const service = req.body;
    serviceCollection.insertOne(service)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // user giving feedback about the service

  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const companyName = req.body.companyName;



    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    reviewCollection.insertOne({ name, companyName, description, image })
      .then(result => {


        res.send(result.insertedCount > 0)
      })



  })

  // admin adding a service

  app.post('/addAService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const description = req.body.description;
    const newImg = file.data;

    const encImg = newImg.toString('base64');
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    newServiceCollection.insertOne({ name, description, image, email })
      .then(result => {
        res.send(result.insertedCount > 0)
      })




  })

  // conforming about admin

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    newServiceCollection.find({ email: email })
      .toArray((err, admin) => {
        res.send(admin.length > 0);
      })
  })

  // get all services for front page

  app.get('/services', (req, res) => {
    newServiceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // get review or feedback 

  app.get('/review', (req, res) => {
    reviewCollection.find({})
      .toArray((err, docs) => {
        res.send(docs)
      })
  })

  // get all service for admin

  app.get('/getUserService', (req, res) => {
    serviceCollection.find({})
      .toArray((err, docs) => {
        res.send(docs)
      })
  })

  // get services for specific user

  app.get('/singleUserServices', (req, res) => {
    serviceCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
});


app.listen(process.env.PORT || port)