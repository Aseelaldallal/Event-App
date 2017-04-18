/* global format */
'use strict'

var faker       = require('faker'),
    User        = require("./models/user"),
    Event       = require("./models/event"),
    fs          = require("fs"),
    aws         = require('aws-sdk');
    
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'ca-central-1'
});

var s3 = new aws.S3();


var numUsers = 300;
var eventCatalog = new Array();
var eventData = './seedData/events.json';
var imageDirectory = "https://s3.ca-central-1.amazonaws.com/eventfulcanada/";
var imageFileNames = new Array(); 

/* ------------------------------------------------- */ 
/* ---------------- GENERATE USERS ----------------- */
/* ------------------------------------------------- */ 

// Create random users and store them in DB
function generateUsers() {
    User.remove({}, function(err) {
       if(err) {
           console.log(err);
       } else {
            for(var i=0; i<numUsers; i++) {  
                var newUser = new User({
                    username: faker.internet.userName()
                });
                User.register(newUser, "password", function(err, response) {
                    if(err) {
                        console.log(err);
                    } 
                });
            }
       }
    });
}


/* ------------------------------------------------- */ 
/* --------------- GENERATE EVENTS ----------------- */
/* ------------------------------------------------- */ 


// Read events from events.json file, associate them with a user, store
// events in events collection, and update user in user collection with new event
function generateEvents() {
    fs.readFile(eventData, 'utf8', function (err, data) {
        if (err) { console.log(err); }
        eventCatalog = JSON.parse(data);
        updateDB();
    });
}


function updateDB() {
    eventCatalog.forEach(function(eventInstance) {
        var rand = Math.ceil(Math.random() * numUsers-1);
        User.findOne().skip(rand).exec(function (err, foundUser) {
            if(err) { console.log(err);    }
            if(foundUser == null) {
                console.log("FOUND USER IS NULL");
            }
            var author = {
                 id: foundUser._id,
                 username: foundUser.username
            }
            eventInstance.author = author;
            Event.create(eventInstance, function(err, newEvent) { 
                 if(foundUser == null) {
                     console.log("FOUND USER IS NULL");
                 }
                 if(err) {console.log(err); }
                 User.findByIdAndUpdate(foundUser._id, {$push: {events: {_id: newEvent._id} }}, function(err, updatedUser) {
                    if(err) { console.log(err); }
                 });
            });
        });
    });
}


/* ------------------------------------------------- */ 
/* --------------- ASSOCIATE IMAGES ---------------- */
/* ------------------------------------------------- */ 

function associateImageWithEvent() {
    console.log("AssociateImageWithEvent");
    Event.find({}, function(err, foundEvents) {
        foundEvents.forEach(function(event) {
            if(Math.random() > 0.3) {
               var numImages = imageFileNames.length; 
               var index = Math.ceil(Math.random() * (numImages-1));
               var imagePath = imageFileNames[index];
               console.log(imagePath);
               if(imagePath != null) {
                   Event.findByIdAndUpdate(event._id , {  $set: { image: imagePath } }, function(err, updatedEvent) {
                        if(err) {console.log(err); }
                   });
               }
            }
        });
    });
}

function listKeys() {
    s3.listObjects({Bucket: process.env.S3_BUCKET_NAME, Prefix: 'uploads/'}, function(err, data){
        if(err) { console.log(err); }
        data.Contents.forEach(function(imageElem) {
            if(imageElem.Size != 0) {
                imageFileNames.push(imageElem.Key);
            }
        });
    });
}



/* ------------------------------------------------- */ 
/* -------------------- SEEDDB --------------------- */
/* ------------------------------------------------- */ 

function seedDB() {

    //generateUsers();
    //generateEvents();
    listKeys();
    setTimeout(function() { associateImageWithEvent(); }, 5000);
}


/* ------------------------------------------------- */ 
/* -------------------- EXPORT --------------------- */
/* ------------------------------------------------- */ 

module.exports = seedDB; 

