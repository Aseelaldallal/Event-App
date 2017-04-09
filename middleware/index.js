/* global moment */

/* ------------------------------------------------------------------- */
/* --------------------------- MIDDLEWARE ---------------------------- */
/* ------------------------------------------------------------------- */


var Event          = require("../models/event"),
    sanitizeHtml   = require('sanitize-html'),
    indicative     = require('indicative'),
    fs             = require('fs'),
    moment         = require('moment');

var middlewareObj = {}; 

const MAX_DESC_LENGTH = 2200;


/* ---------------------------- FUNCTIONS ----------------------------- */


// Checks whether user is logged in. Redirects to events if not logged in
middlewareObj.isLoggedIn = function(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    } 
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};



// Checks whether the event stored in the request belongs to the currently logged in user
middlewareObj.checkEventOwnership = function(req,res,next) {
   
    if(req.isAuthenticated()) {
        Event.findById(req.params.id, function(err, foundEvent) { // Find the event
           if(err) {
               next(err);
            } else {
                if(foundEvent.author.id.equals(req.user._id)) { // Check if the event's author's id is the same as logged in user's ids
                    return next(); 
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("/events/" + foundEvent._id);
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("/login");
    }
};




// Sanitize html: https://www.npmjs.com/package/sanitize-html
middlewareObj.sanitizeUserInput = function(req,res,next) {
    for(var key in req.body) {
        if(req.body[key]) {
            req.body[key] = sanitizeHtml(req.body[key], { allowedTags: [], allowedAttributes:[]});
        }
    }
    return next(); 
};

// Back-end validation for new events. Same validation as front end, except not
// validating if city is Canadian -- doesn't work too well with indicative, skipped
// there is a bug in indicative before_offset_of. I fixed it. If you download new version
// test, if bug, fix again
middlewareObj.validateNewEvent = function(req,res,next) {
        for(var key in req.body) {
            req.body[key] = req.body[key].trim(); 
            if(req.body[key] == "") {
                req.body[key] = undefined;
            } 
        }
        
        //Count the number of new line characters (see http://bit.ly/2mKBW4K)
        var maxLength = 2200;
        if(req.body.description) {
            var numberOfLineBreaks = (req.body.description.match(/\n/g)||[]).length;
            maxLength = MAX_DESC_LENGTH + numberOfLineBreaks;
        }
        var descriptionRule = 'required|min:200|max:' + maxLength;
        
        indicative.extend('time', time, 'Invalid time');
        indicative.extend('postalcode', postalcode, 'Invalid Postal Code');
        indicative.extend('canadianprovince', canadianprovince, 'Invalid Canadian Province');
        indicative.extend('currency500', currency500, 'Invalid Cost'); 
        
        const messages = {
          'name.required': 'Title: required.',
          'date.required': 'Date: required.',
          'starttime.required': 'Start time: required.',
          'address.required': 'Address: required.',
          'city.required': 'City: required.',
          'province.required': 'Province: required.',
          'description.required': 'Event Description: required.',
          'eventCost.required': 'Event Cost: required.',
          'organizerName.required': 'Organizer Name: required.',
          'organizerEmail.required': 'Organizer Email: required.',
          'name.max': 'Event Title: Exceeded limit of 130 characters',
          'date.date': 'Date: Invalid. Use the following format: YYYY-MM-DD',
          'date.date_format': 'Date: Invalid. Use the following format: YYYY-MM-DD',
          'date.before_offset_of': 'Date: You can only post events happening within the next year',
          'date.after_offset_of': 'Date: You cannot post a past event',
          'description.min': 'Event Description: Must be at least 200 characters. ',
          'description.max': 'Event Description: Exceeded limit of 2200 characters',
          'eventURL.url': 'Event Website: Invalid URL',
          'registerationURL.url': 'Ticket Sale / Registeration URL: Invalid URL',
          'organizerEmail.email': 'Organizer Email: Invalid Email Address',
          'starttime.time': 'Start Time: Invalid Time. Please use the following format hh:mm AM or hh:mm PM',
          'endtime.time': 'End Time: Invalid Time. Please use the following format hh:mm AM or hh:mm PM',
          'postalCode.postalcode': 'Postal Code: Invalid Postal Code. Please use the following format: A1A 1A1',
          'province.canadianprovince': 'Province: Not a valid Canadian Province'
        };
        
        const rules = {
            name: 'required|max:130',
            date: 'required|date|date_format:YYYY-MM-DD|before_offset_of:1,year|after_offset_of:-1,days',
            starttime: 'required|time',
            endtime: 'time',
            address: 'required',
            city: 'required',
            province: 'required|canadianprovince',
            postalCode: 'postalcode',
            description: descriptionRule,
            eventCost: 'required',
            eventURL: 'url',
            registerationURL: 'url',
            organizerName: 'required',
            organizerEmail: 'required|email'
        };
       
        const data = {
            name: req.body.name,
            date: req.body.date,
            starttime: req.body.starttime,
            endtime:req.body.endtime,
            address: req.body.address,
            city: req.body.city,
            province: req.body.province, 
            postalCode: req.body.postalCode,
            description: req.body.description,
            eventCost: req.body.eventCost,
            eventURL: req.body.eventURL,
            registerationURL: req.body.regURL,
            organizerName: req.body.organizerName, 
            organizerEmail: req.body.organizerEmail
        };
        
        var validationErrors = []; 
        
        indicative
        .validateAll(data, rules, messages)
        .then(function() { // validation success
            if(req.file) {
                var msg = checkIfImgFileValid(req.file);
                if(msg != "") {
                    validationErrors.push(msg);
                    deleteUploadedFile(req.file,next);
                    req.flash("error", validationErrors);
                    res.redirect("back");
                } else {
                    return next();
                }
            } else {
                return next();
            }
        })
        .catch(function(errors) { // validation fail
            var validationErrors = getValidationErrors(errors);
            if(req.file) {
                var msg = checkIfImgFileValid(req.file);
                if(msg != "") {
                    validationErrors.push(msg);
                }
            }
            deleteUploadedFile(req.file, next);
            req.flash("error", validationErrors);
            res.redirect("back"); 
        });
        

};


// Back end validation for index page. Makes sure that user doesn't input bad date
// If user inputs bad date, defaults to server date
middlewareObj.validateDate = function (req,res,next) {
    if( req.query.dateToFind ) {
        var isValidDate = moment(req.query.dateToFind, "YYYY-MM-DD").format("YYYY-MM-DD") == req.query.dateToFind;
        if(!isValidDate) {
            var err = {
                status: 400,
                message: "Invalid Date: " + req.query.dateToFind
            }
            return next(err);
        } 
    }
    return next();
}

/* ------------------------- HELPER FUNCTIONS ------------------------- */

// Deletes file from server
function deleteUploadedFile(file, next) {
    console.log("In delete uploaded file");
    if(file) {
        fs.unlink(file.path, function(err) {
           if(err) {
               next(err);
           }
        });
    }
}


// Errors in an array of objects. Each object has a field, validation, and message. This function
// extracts message from each object, and compiles them into one string. It then returns the string.
function getValidationErrors(errors) {
    var messages = [];
    errors.forEach(function(msgObject) {
        messages.push(msgObject.message);
    })
    return messages;
}

function fileSizeOK(file) {
    var maxFileSize = 1000000;
    if(file.size < maxFileSize) {
        return true;
    }
    return false;
}

function fileTypeOK(file) {
    var imageType = /^image\//;
    if (imageType.test(file.mimetype)) {
        return true;
    }
    return false;
}

function checkIfImgFileValid(file) {
    var msg = "";
    if(!fileTypeOK(file)) {
        msg = "Invalid File Type. Please upload an image file";
    } else if(!fileSizeOK(file)) {
        var uploadedFileSize = (file.size/1000000).toFixed(2);
        msg = "File too large. Max File Size is 1 MB. Your file size is " + uploadedFileSize + " MB.";
    }
    return msg;
}



/* ------------------------ EXTENDING INDICATIVE ----------------------- */

// EXTENDING INDICATIVE SCHEMA VALIDATOR : http://indicative.adonisjs.com/#indicative-extending-extending-schema-validator

// Validates that field is a valid time in the following format: hh:mm AM or hh:mm PM
function time(data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
        const fieldValue = get(data, field);
        if(!fieldValue) {
          return resolve('validation skipped')
        }
        var patt = new RegExp("^(([0-9][0-2]?)|([0][0-9])):[0-5][0-9] [APap][mM]$"); 
        var isTime = patt.test(fieldValue);
        if(isTime) {
            resolve("Valid time");
        } else {
            reject(message);
        }
    });
}

// Validates that field is a valid postalcode
function postalcode(data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
        const fieldValue = get(data, field);
        if(!fieldValue) {
          return resolve('validation skipped')
        }
        var postalCodePatt = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
        if(fieldValue.match(postalCodePatt)) {
            resolve("Valid Postal Code");
        } else {
            reject(message);
        }
    });
}

// Validates that field is a valid Canadian province
function canadianprovince(data, field, message, args, get) {
    return new Promise(function (resolve, reject) {
        const fieldValue = get(data, field);
        if(!fieldValue) {
          return resolve('validation skipped')
        }
        var canadianProvinces = ['ON', 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'PE', 'QC', 'SK', 'YT', 
                                'ONTARIO', "ALBERTA", "BRITISH COLUMBIA", "MANITOBA", "NEW BRUNSWICK", "NEWFOUNDLAND AND LABRADOR",
                                'NOVA SCOTIA', 'NORTHWEST TERRITORIES', 'NUNAVUT', 'PRINCE EDWARD ISLAND', 'QUEBEC', 'SASKATCHEWAN', 'YUKON'];
        var prov = fieldValue.toUpperCase();
        if(canadianProvinces.indexOf(prov) === -1) {
            reject(message);
        } else {
            resolve("Valid Canadian Province");
        }
    });
}

// Validates that field is a valid cost that is less than $500.00
function currency500(data,field,message,args,get) {
    return new Promise(function (resolve, reject) {
        const fieldValue = get(data, field);
        if(!fieldValue) {
          return resolve('validation skipped')
        }
        var cost = fieldValue; 
        if(cost.substr(0,1) === "$") {
           cost = cost.substr(1).trim();
        }
        var parsedCost = parseInt(cost, 10);
        if(isNaN(parsedCost)) {
            reject("Event Cost: Invalid cost. Cost is in CAD. Use this form: x.xx");
        } else {
            var pattern = new RegExp(/^[0-9][0-9]{0,3}\.{0,1}[0-9]{0,2}$/);
            if(cost > 500 ) {
                reject("Invalid cost. We only post events that cost less than $500.00");                
            } else if(!pattern.test(cost)){
                reject("Event Cost: Invalid cost. Cost is in CAD. Use this form: x.xx");
            } else {
                resolve("Valid cost"); 
            }
        } 
    });    
}

/* ------------------------------ EXPORT ------------------------------ */


module.exports = middlewareObj; 