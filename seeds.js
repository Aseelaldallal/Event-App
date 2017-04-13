/* global format */
'use strict'

var faker       = require('faker'),
    User        = require("./models/user"),
    Event       = require("./models/event"),
    fs          = require("fs");


var numUsers = 250;
var eventCatalog = new Array();
var eventData = './seedData/events.json';
var imageDirectory = './public/uploads/eventImages';
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
        var rand = Math.floor(Math.random() * numUsers);
        User.findOne().skip(rand).exec(function (err, foundUser) {
            if(err) { console.log(err);    }
            var author = {
                 id: foundUser._id,
                 username: foundUser.username
            }
            eventInstance.author = author;
            Event.create(eventInstance, function(err, newEvent) { 
                 if(err) {console.log(err); }
                 console.log("Found User ID: " + foundUser._id);
                 User.findByIdAndUpdate(foundUser._id, {$push: {events: {_id: newEvent._id} }}, function(err, updatedUser) {
                    if(err) { console.log(err); }
                    console.log(updatedUser);
                 });
            });
        });
    });
}


/* ------------------------------------------------- */ 
/* --------------- ASSOCIATE IMAGES ---------------- */
/* ------------------------------------------------- */ 

function associateImageWithEvent() {
    fs.readdir(imageDirectory, (err, files) => {
        imageFileNames = files;
        Event.find({}, function(err, foundEvents) {
            foundEvents.forEach(function(event) {
                if(Math.random() > 0.3) {
                   var numImages = imageFileNames.length; 
                   var index = Math.floor(Math.random() * (numImages+1));
                   var imagePath = "/uploads/eventImages/" + imageFileNames[index];
                   Event.findByIdAndUpdate(event._id , {  $set: { image: imagePath } }, function(err, updatedEvent) {
                        console.log(updatedEvent);
                   });
                }
            });
        });
    });
}



/* ------------------------------------------------- */ 
/* -------------------- SEEDDB --------------------- */
/* ------------------------------------------------- */ 

function seedDB() {
 /*   generateUsers();
    setTimeout(function() {
        generateEvents();
    }, 250000);*/
    //associateImageWithEvent();
}


/* ------------------------------------------------- */ 
/* -------------------- EXPORT --------------------- */
/* ------------------------------------------------- */ 

module.exports = seedDB; 

