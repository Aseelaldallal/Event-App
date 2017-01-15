
/* global $ */
/* global google */

var place; // move this to event section later
var picklist; 
var map;

/* ------------------ CONSTANTS ------------------ */

const MAX_INPUT_LENGTH = 100;
const MAX_DESC_LENGTH = 1500;


/* ---------------- DOCUMENT.READY ---------------- */

/* When the document loads:
 * 1. Setup Input Fields
 * 2. Add Validation Listeners to Input Fields
 */
$(document).ready(function() {
   
    eventTitleSetup();
    eventDateSetup();
    eventTimeSetup(); 
    eventLocationSetup();
    eventImageSetup();
    setMaxInputLength(MAX_INPUT_LENGTH, MAX_DESC_LENGTH);

});


 
/* ----------------- EVENT TITLE ------------------ */

// Limit input field size to 100 chars
// Tooltip:
//      Let user now how many characters remaining
//      When input field looses focus, remove tooltip
// Error: 
//      If user leaves field blank, make error appear
//      Make sure there is no error when user starts typing

function eventTitleSetup() {
    
    // Limit input field size to 100 chars
    $('#name').attr('maxlength', MAX_INPUT_LENGTH);
    
    // Display Tooltip on Focus. 
    $('#name').on('focus', function() {
        safeRemoveClass($('#nameTip'), 'hidden');
        safeAddClass($('#nameError'), 'hidden');
        showRemainingChars();
    });
    
    // When focus is lost
    //      Remove tooltip
    //      Display error if event title empty
    $('#name').on('blur', function() {
        safeAddClass($('#nameTip'), 'hidden');
        if($('#name').val().length == 0) {
            safeRemoveClass($('#nameError'), 'hidden');
            $('#nameError').empty();
            $('#nameError').append("<p> This field is required </p>");
        } else {
            safeAddClass($('#nameError'), 'hidden');
        }
    });
    
    // Let user know how many characters remaining dynamically
    $('#name').on('keyup', showRemainingChars); 

}

/* This function will update the event name tooltip with the number of
 * characters remaining. Make sure the error message is hidden when user starts typing
 */
function showRemainingChars() {
    var numChars = $('#name').val().length;
    var remaining = MAX_INPUT_LENGTH - numChars;
    $('#charsLeft').text(remaining);
    if(numChars > 0) {
        safeAddClass($('#nameError'), 'hidden');
    }
}



/* ------------------ EVENT DATE ------------------ */

// Add Min and Max attributes to date tag
// Error:
//      Date format is yyyy-mm-dd
//      Date is not empty
//      Date is within one year
// Tooltip: Tell user that date must be within one year

function eventDateSetup() {
    
    
    // Dealing with color: By default, HTML 5 inserts yyyy-mm-dd into input field, meaning there is no placeholder
    // and text will be black. Change it to placeholder color.
    safeAddClass($('#date'), 'placeholderColor');
    
    $('#date').on('change', function() {
       if($('#date').val() == '') {
            safeAddClass($('#date'), 'placeholderColor');
       } else {
            safeRemoveClass($('#date'), 'placeholderColor');
       }
    });
     
    // Add min and max attributes to html
    var today = new Date(Date.now()),
        todayDate = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate(),
        oneYearFromToday = (today.getFullYear() + 1) + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    $('#date').attr("min", todayDate);
    $('#date').attr("max", oneYearFromToday);
        
    // When date has focus, display tooltip, hide errors
    $('#date').on('focus', function() {
        safeRemoveClass($('#dateTip'), 'hidden');
        safeAddClass($('#dateError'), 'hidden');
    });
    
    
    // When date looses focus
    //      Remove tooltip
    //      Check for errors
    $('#date').on('blur', function() {
        
        safeAddClass($('#dateTip'), 'hidden');
        
        var userInput = $('#date').val();
        var eventDate = new Date(userInput);
        var error = ""; 
        
        if( userInput.length === 0 ) {
            error = "This field is Required"
        } else if(eventDate == "Invalid Date") {
            error = "Invalid Date. Date must be in the format yyyy-mm-dd"
        } else if( eventDate < today ) {
            error = "You cannot post past events"
        } else if (eventDate > (new Date(oneYearFromToday))) {
            error = "You can only post events happening within the next year"
        } 
        
        if(error != "") {
            safeRemoveClass($('#dateError'), 'hidden');
            $('#dateError').empty(); 
            $('#dateError').append("<p>" + error + "</p>");
        } else {
            safeAddClass($('#dateError'), 'hidden');
             $('#dateError').empty(); 
        }
        
    });
    
    
}

/* ---------------- EVENT START END --------------- */

// Add JQuery Timepicker: http://timepicker.co/
// Errors:
// 	    Start time is invalid
//  	End time is invalid
//  	Start time is empty
// 	    End time is empty
// 	    End time is before start time
//      Event must be at least half an hour
function eventTimeSetup() {
    
    var starttime = $('#starttime'),
        endtime = $('#endtime'),
        startErrorDiv = $('#startError'),
        endErrorDiv = $('#endError'),
        startConflict = false,
        endConflict = false;
        
    
    var options = {
        timeFormat: 'h:mm p',
        dynamic: false,
        dropdown: false
    }
    starttime.timepicker(options);
    endtime.timepicker(options);

    // On Focus, hide errors
    starttime.on('focus', function() {
        startErrorDiv.empty();
        safeAddClass(startErrorDiv, 'hidden');
    });
    
    // On blur
    //      Check that field is not empty
    //      Check that time is valid
    starttime.on('blur', function(event) {
        console.log("event.target : " + event.target);
        var isEqual = (event.target === starttime[0]);
        console.log("event.target === starttime input field : ", isEqual);
        var dummyStart = new Date("December 11 2016 " + starttime.val());
        var dummyEnd =  new Date("December 11 2016 " + endtime.val());
        if(starttime.val().length == 0 ) { // If start field is empty
            displayError(startErrorDiv, "This field is required");
        } if( dummyStart == "Invalid Date") { // If time is invalid
            displayError(startErrorDiv, "Invalid Time");
        } else if (endtime.val().length > 0 && dummyEnd != "Invalid Date") { // If start and end time are valid and entered
            if(dummyStart > dummyEnd ) { // Time Pair Error
                if(endConflict) {
                    endConflict = false;
                    removeError(endErrorDiv);
                }
                startConflict = true;
                displayError(startErrorDiv,"Invalid Time. Start time must be earlier than end time.");
            } else {
                endConflict = false;
                removeError(endErrorDiv);
                startConflict = false;
                removeError(startErrorDiv);
            }
        }
    });
    
    //On Focus, hide errors
    endtime.on('focus', function() {
        endErrorDiv.empty();
        safeAddClass(endErrorDiv, 'hidden');
    });
    
    // On blur
    //      Check that field is not empty
    //      Check that time is valid
    endtime.on('blur', function() {
        var dummyStart = new Date("December 11 2016 " + starttime.val());
        var dummyEnd =  new Date("December 11 2016 " + endtime.val());
        if(endtime.val().length == 0 ) { // If start field is empty
            displayError(endErrorDiv, "This field is required");
        } if( dummyEnd == "Invalid Date") { // If time is invalid
            displayError(endErrorDiv, "Invalid Time");
        } else if (starttime.val().length > 0 && dummyStart != "Invalid Date") { // If start and end time are valid and entered
            if(dummyStart > dummyEnd ) { // Time Pair Error
                console.log("Time Pair Error");
                if(startConflict) {
                    startConflict = false;
                    removeError(startErrorDiv);
                }
                endConflict = true;
                displayError(endErrorDiv, "Invalid Time. End time must be after start time.");
            } else {
                endConflict = false;
                removeError(endErrorDiv);
                startConflict = false;
                removeError(startErrorDiv);
            }
        }
    });
    
}



/* ---------------- EVENT LOCATION --------------- */

// Add Google Places Autocomplete to first event details input field
// If user selects address from picklist, clicks "can't find address", or clicks "enter address manually", show the address details fields
// If an address was selected from picklist, populate the address details fields automatically and show a map
// If a user enters a valid address manually, update the map
function eventLocationSetup() {

    // Prevent user from typing enter or tab
    $('#location').on('keydown', function(e) {
       if(e.which == 13 || e.which == 9) {
           event.preventDefault();
       }
    });
    
    $('#location').on('click', function() {
        addCantFindAddress();
    });
    
    // Allow user to enter address manually
    $('#enterAddress').on('click', function() {
       displayAddressDetailsForm();
    });
    
    // Allow user to reset location
    $('#resetLocation').on('click', function() {
        displayLocationSearchField();
        safeAddClass($('#googleMap'), 'hidden');
        safeRemoveClass($('#noMapAvailContainer'),'hidden');
    });
    
    // Setup Google Autocomplete. Restrict Searches to Canada
    var options = { componentRestrictions: {country: 'ca'} };
    var autocomplete = new google.maps.places.Autocomplete($('#location')[0], options);
    
    // Update Address Details and Map when user types address
    autocomplete.addListener('place_changed', function() {
        place = autocomplete.getPlace();
        if(place && place.geometry) {
            fillOutDetailedAddressForm(place);
            setTimeout(function() {
                displayAddressDetailsForm();
                displayMap(place);
            },1000); 
        } 
    });
    $('#address').on('blur', function()    { findGeocodeAndMap(); });
    $('#city').on('blur', function()       { findGeocodeAndMap(); });
    $('#province').on('blur', function()   { findGeocodeAndMap(); });
    $('#postalCode').on('blur', function() { findGeocodeAndMap(); });
    
    // If user checks show map, set the value of checkbox to map geometry
    $('#showMap').on('click', function() {
        if($( "#showMap:checked" ).length > 0) {// checked
            if(map) { // If map is defined
                $('#showMap').val(map.getCenter());
            }
        } else {
            $('#showMap').val('');
        }
    })
    
}

function findGeocodeAndMap() {
    var geocoder = new google.maps.Geocoder();
    var address = $('#address').val() + " " + $('#city').val() + " " + $('#province').val() + " " + $('#postalCode').val() + " ";
    geocoder.geocode({
        'address': address, 
        'componentRestrictions': {'country':'CA'}
    }, 
    function(results, status) {
        console.log("results: ", results);
        if (status === 'OK') {
            safeRemoveClass($('#googleMap'), 'hidden');
            safeAddClass($('#noMapAvailContainer'),'hidden');
            map = new google.maps.Map(document.getElementById('googleMap'));
            map.setCenter(results[0].geometry.location);
            map.setZoom(14);
            if($( "#showMap:checked" ).length > 0) {// checked
                $('#showMap').val(map.getCenter());
            }
            var infowindow = new google.maps.InfoWindow();
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            infowindow.setContent(results[0].formatted_address);
            infowindow.open(map, marker);
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    }); 
}


// Add a "Can't find Address" link to the dropdown list that appears when user starts typing address (google picklist)
function addCantFindAddress() {
    picklist = document.getElementsByClassName('pac-container')[0];
    var linkCollection = picklist.getElementsByTagName('a'); // htmlCollection
    if(linkCollection.length == 0) {
        var aTag = "<div class='pac-item'><span class='pac-icon'></span><a class='pac-item-query' onmousedown='displayAddressDetailsForm();'>Can't find address? </a></div>";
        $(picklist).append(aTag);
    }
}


// Precondition: place has a geometry. Display place on google map
function displayMap(place) {

    safeRemoveClass($('#googleMap'), 'hidden');
    safeAddClass($('#noMapAvailContainer'),'hidden');
    
    map = new google.maps.Map(document.getElementById('googleMap'));

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });
    
    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
    }
    map.setZoom(12);
    
    if($( "#showMap:checked" ).length > 0) {// checked
        $('#showMap').val(map.getCenter());
    }
    
    marker.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
    }));
    
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    
    var address = '';
    if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
    }
    
    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker);
    
}

// Display Address Details input fields
// Adjust height of map
function displayAddressDetailsForm() {
    hideLocationSearchField();
    safeRemoveClass($('#locationDetails'), 'hidden'); // show details
    var locDHeight = $('#locationDetailsText').height() // set map height
    $("#mapContainer").height(locDHeight);

}

// Display google autocomplete search field and hide address details fields
function displayLocationSearchField() {
    hideAddressDetails();
    safeRemoveClass($('#locationSearch'), 'hidden'); // show search field
}

// Empty Google Autocomplete input field
// Hide Google Autocomplete input field
// Clear any errors related to google autocomplete
function hideLocationSearchField() {
    $('#location').val('');
    safeAddClass($('#locationSearch'),'hidden');
}


// Clear values from address details
// Remove any errors associated with address details
// clear map === MUST IMPLEMENT
function hideAddressDetails() {
    clearAddressValues();
    safeAddClass($('#locationDetails'),'hidden');
}


// Clear user input from address details form
function clearAddressValues() {
    $('#venueName').val('');
    $('#address').val('');
    $('#city').val('');
    $('#province').val('');
    $('#postalCode').val('');
    $('#unit').val('');
}




// Place is a PlaceResult Object. Use this object to fill out the
// input fields in the div locationDetailsText 
function fillOutDetailedAddressForm(place) {

    var details = new Array(); 
    
    var componentForm = {
            street_number: 'short_name',
            route: 'short_name', // Address = street number + route
            locality: 'long_name', // City
            administrative_area_level_1: 'short_name', // Province
            postal_code: 'short_name',
            subpremise: 'long_name' // Unit Number
    };   
        
    for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            details[addressType] = val;
          }
    }
        
    // Empty all fields first (to not carry on from previous query)
    clearAddressValues();
        
    // Fill in Address Field
    if(details["street_number"] !== undefined && details["route"] !== undefined) {
        $('#address').val(details["street_number"] + " " + details["route"]);
    } else if (details["street_number"] === undefined) {
        $('#address').val(details["route"]);
    } else {
        $('#address').val(details["street_number"]);
    }

    // Fill in the Venue Name Field
    if(place.name !== $('#address').val()) { // Make sure that its not the same as the address
        $('#venueName').val(place.name);
    }
    
    // Fill in City
    if(details["locality"] !== undefined) {
        $('#city').val(details["locality"]);
    }

    // Fill in Province
    if(details["administrative_area_level_1"] !== undefined) {
        $('#province').val(details["administrative_area_level_1"]);
    }
    
    // Fill in Postal Code
    if(details["postal_code"] !== undefined) {
        $('#postalCode').val(details["postal_code"]);
    }
    
    // Fill in unit number
    if( details["subpremise"] !== undefined) {
        $('#unit').val(details["subpremise"]);
    }
    
}


/* ----------------- IMAGE UPLOAD ----------------- */


function eventImageSetup() {
    
    var dropbox = document.getElementById("dropbox"),
        fileElem = document.getElementById("fileElem"),
        fileSelect = document.getElementById("fileSelect");

    fileSelect.addEventListener("click", function(e) {
        if (fileElem) {
            fileElem.click(); 
        }
    }, false);

    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);

}

function dragenter(e) { 
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) { 
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    var dt = e.dataTransfer;
    var files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    var file = files[0];
    var imageType = /^image\//;
    if (!imageType.test(file.type)) {
        alert("NOT AN IMAGE");
        return;
    }
    var img = document.createElement("img");
    img.classList.add("obj");
    img.file = file;
    img.height = Math.max($('#dropbox').height(),$('#preview').height()) ;
    img.width = Math.max($('#dropbox').width(),$('#preview').width()) ;

    $('#dropbox').addClass('hidden');
    $('#preview').removeClass('hidden');
    $('#preview').empty(); 
    $('#preview').append(img);
    $('#fileSelect').text('Replace Image');
    
    var reader = new FileReader();
    reader.onload = (function(aImg) {
        return function(e) {
            aImg.src = e.target.result;
        };
    })(img);
    reader.readAsDataURL(file)
}


/* ----------------- INPUT LENGTHS ---------------- */

// Iterate through all input fields and set maxlength attribute to num.
// Set the maxlength attribute of description textarea to dlength
function setMaxInputLength(num, dlength) {
    var inputs = document.getElementsByTagName('input');
    Array.prototype.forEach.call(inputs, function(inputField) {
        limitLength(inputField, num);
    });
    limitLength(document.getElementById('description'), dlength); 
}


// Set the maxlength attribute of inputField to inputLength
function limitLength(inputField, inputLength) {
    var att = document.createAttribute("maxlength");
    att.value = inputLength;
    inputField.setAttributeNode(att);   
}




/* --------------- HELPER FUNCTIONS --------------- */


/* Removes hidden class from errorDiv
/* Adds a p tag as a child of errorDiv, with message
 */
function displayError(errorDiv, message) {
    errorDiv.empty(); // clear previous errors
    safeRemoveClass(errorDiv, 'hidden');
    errorDiv.append("<p>" + message + "</p>");
}

/* Adds hidden class to errorDiv
/* Removes all children from errorDiv
 */
function removeError(errorDiv) {
    errorDiv.empty();
    safeAddClass(errorDiv,'hidden');
}

/* element: An html element node
 * theClass: the name of a class
 * Add class theClass to element
 */
function safeAddClass(element, theClass) {
    if(!element.hasClass(theClass) ) {
        element.addClass(theClass);
    }
}


/* element: An html element node
 * theClass: the name of a class
 * Removes class theClass from element
 */
function safeRemoveClass(element, theClass) {
    if(element.hasClass(theClass) ) {
        element.removeClass(theClass);
    }
}


