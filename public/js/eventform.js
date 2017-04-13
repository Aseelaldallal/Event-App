
/* global $ */
/* global google */
/* global moment */






/* --------------------- GLOBAL -------------------- */


var map;

/* ------------------- CONSTANTS ------------------ */

const MAX_INPUT_LENGTH = 130;
const MAX_DESC_LENGTH = 2200;
const MIN_DESC_LENGTH = 200; 
const MAX_EVENT_COST = 500; 
const MAX_FILE_SIZE = 1000000; //bytes

/* ----------------- Error Handling --------------- */

// This array keeps track of user input errors. It stores the element id associated with the error
// as a string
var errors = []; 


/* -------------- VALIDATE ON SUBMIT --------------- */


function validate(form) {
    var reqFieldsCollection = document.getElementsByClassName('req');
    Array.prototype.forEach.call(reqFieldsCollection, function(field) {
    if(field.value == '') {
          var errorDivId = '#' + field.id + "Error";
          var fieldId = '#' + field.id;
          var message = "This field is required";
          if(field.id === "address" || field.id === "province" || field.id === "city") {
              message = field.id + " field is required";
          }
          displayError($(errorDivId), $(fieldId), message);
       }
    });
    errors.sort();
    if(errors.length > 0 ) {
        var idName = "#" + errors[0][0];
        if( $(idName).parents('section').length === 1 ) { // Dealing with nested sections
            idName = "#" + $(idName).parents('section')[0].id;
        }
        $(window).scrollTop($(idName).offset().top);
        return false;
    }

    return true;
}



/* ---------------- DOCUMENT.READY ---------------- */

// When the document loads:
// 1. Setup Input Fields
// 2. Add Validation Listeners to Input Fields
$(document).ready(function() {
    eventTitleSetup();
    eventDateSetup();
    eventTimeSetup(); 
    eventLocationSetup();
    eventDescriptionSetup(); 
    eventWebsiteSetup(); 
    eventImageSetup();
    eventRegSetup(); 
    eventOrganizerSetup(); 
    setMaxInputLength(MAX_INPUT_LENGTH, MAX_DESC_LENGTH);

});

/* ---------- EDIT PAGE SPECIFIC FUNCTION ---------- */



/* ----------------- EVENT TITLE ------------------ */

// Tooltip:
//      Let user now how many characters remaining
//      When input field looses focus, remove tooltip
// Error: 
//      If user leaves field blank, make error appear
//      Make sure there is no error when user starts typing

function eventTitleSetup() {
    
    // On Focus: Remove Errors, Display Tooltip
    $('#name').on('focus', function() {
        $('#nameTip').removeClass('hidden');
        showRemainingChars($('#nameCharsLeft'), $('#name'), MAX_INPUT_LENGTH);
        removeError($('#nameError'), $('#name'));
    });
    
    // On Blur, remove tooltip. If error, display error.
    $('#name').on('blur', function() {
        $('#nameTip').addClass('hidden');
        if(checkIfEmptyField($('#name'))) {
            displayError($('#nameError'), $('#name'), "This field is required");
        }
    });
    
    // Let user know how many characters remaining dynamically
    $('#name').on('keyup', function() {
        showRemainingChars($('#nameCharsLeft'), $('#name'), MAX_INPUT_LENGTH); 
    }); 
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
    if($('#date').val() == '') {
        $('#date').addClass('placeholderColor');
    }
    
    $('#date').on('change', function() {
       if($('#date').val() == '') {
            $('#date').addClass('placeholderColor');
       } else {
             $('#date').removeClass('placeholderColor');
       }
    });
     
        
    // When date has focus, display tooltip, hide errors
    $('#date').on('focus', function() {
         removeError($('#dateError'), $('#date'));
    });
    
    
    // On blur, check for errors
    $('#date').on('blur', function() {
        
        var userInput = $.trim($('#date').val());
        var userInputMoment = moment(userInput);
        var todayMoment = moment();
        var oneYearFromTodayMoment = todayMoment.clone().add(1,'year'); 

        var error = ""; 

        if(checkIfEmptyField($('#date'))) {
            error = "This field is Required";
        } else if(!userInputMoment.isValid()) {
            error = "Invalid Date. Date must be in the format yyyy-mm-dd";
        } else if( userInputMoment.isBefore(todayMoment) ) {
            error = "You cannot post past events or events happening today";
        } else if ( userInputMoment.isAfter(oneYearFromTodayMoment) ) {
            error = "You can only post events happening within the next year";
        } 
        
        if(error != "") {
            displayError($('#dateError'), $('#date'), error );
        } 
        
    });
    
    
}

/* ---------------- EVENT START END --------------- */

// Add JQuery Timepicker: http://timepicker.co/
// Errors:
// 	    Start time is invalid
//  	End time is invalid
//  	Start time is empty
function eventTimeSetup() {
    
    var starttime = $('#starttime'),
        endtime = $('#endtime'),
        startErrorDiv = $('#starttimeError'),
        endErrorDiv = $('#endtimeError');
        
    var options = {
        timeFormat: 'h:mm p',
        dynamic: false,
        dropdown: false
    };
    
    starttime.timepicker(options);
    endtime.timepicker(options);

    // On Focus remove errors
    starttime.on('focus', function() {
        removeError(startErrorDiv, starttime);
    });
    
    // On blur
    //      Check that field is not empty
    //      Check that time is valid
    starttime.on('blur', function(event) {
        var dummyStart = new Date("December 11 2016 " + starttime.val());
        if(checkIfEmptyField(starttime) ) { 
            displayError(startErrorDiv, starttime, "This field is required");
        } if( dummyStart == "Invalid Date") { // If time is invalid
            displayError(startErrorDiv, starttime, "Invalid Time");
        } 
    });
    
    //On Focus hide errors
    endtime.on('focus', function() {
        removeError(endErrorDiv, endtime);
    });
    
    // On blur
    //      Check that field is not empty
    //      Check that time is valid
    endtime.on('blur', function() {
        checkIfEmptyField(endtime);
        var dummyEnd =  new Date("December 11 2016 " + endtime.val());
        if( dummyEnd == "Invalid Date") { // If time is invalid
            displayError(endErrorDiv, endtime, "Invalid Time");
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
    
    // Adjust Map Height
    var locDHeight = $('#locationDetailsText').height(); // set map height
    $("#mapContainer").height(locDHeight);
    

    
    // Allow user to reset location
    $('#resetLocation').on('click', function() {
        $('#location').val('');
        clearAddressValues();
        removeLocationErrors(); 
    });
    
    // Setup Google Autocomplete. Restrict Searches to Canada
    var options = { componentRestrictions: {country: 'ca'} };
    var autocomplete = new google.maps.places.Autocomplete($('#location')[0], options);
    
    // Update Address Details and Map when user types address
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if(place && place.geometry) {
            fillOutDetailedAddressForm(place);
            displayMap(place);
        }
    });
    

    // If user checks show map, set the value of checkbox to map geometry
    $('#showMap').on('click', function() {
        $('#showMapTip').toggleClass('hidden');
        if($( "#showMap:checked" ).length > 0) {// checked
            if(map) { // If map is defined
                var coordinates = map.getCenter().toString();
                coordinates = coordinates.substring(1,coordinates.length-1);
                $('#showMap').val(coordinates);
            }
        } else {
            $('#showMap').val('');
        }
    });
    
    readAddressField(); 
    readCityField(); 
    readProvinceField(); 
    readPostalCodeField(); 
    readVenueField();
    readUnitField(); 

}

// Remove any errors associated with event location
function removeLocationErrors() {
    removeError($('#addressError'),$('#address'));
    removeError($('#cityError'),$('#city'));
    removeError($('#provinceError'),$('#province')); 
    removeError($('#postalCodeError'),$('#postalCode')); 
}

// Removes spaces from venue name field if any
function readVenueField() {
    $('#venueName').on('blur', function() {
        checkIfEmptyField($('#venueName'));
    });
}

// Removes spaces from venue unit field if any
function readUnitField() {
    $('#unit').on('blur', function() {
        checkIfEmptyField($('#unit'));
    });
}

// Makes sure that address field is not empty, and attemps to map the address
function readAddressField() {
    $('#address').on('blur', function() {
        findGeocodeAndMap();
        if(checkIfEmptyField($('#address'))) {
            displayError($('#addressError'), $('#address'), "Address field is required");
        }
    });
    $('#address').on('focus', function() {
        removeError($('#addressError'),$('#address')); 
    });
}


// Ensures that city field is not empty, and that the city exists in Canada (using google geocoding api).
// If no error, attemps to map
function readCityField() {
    
    $('#city').on('blur', function() {
        findGeocodeAndMap();
        if(checkIfEmptyField($('#city'))) {
           displayError($('#cityError'), $('#city'), "City is required");
        } else {
            var city = $('#city').val().toLowerCase();
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode(
                { address: city, 
                  componentRestrictions: { country: 'CA'}
                }, function(results, status) {
                    if (status === 'OK') {
                        var isCity = false;
                        results[0].address_components.forEach(function (address_component) {
                            if (address_component.types[0] == "locality"){
                            	if(address_component.long_name.toLowerCase().trim() == city || address_component.short_name.toLowerCase().trim() == city) {
                                    isCity = true;
                                } 
                    		}
                        });
                        if(!isCity) {
                            displayError($('#cityError'), $('#city'), city + " is not a city in Canada");
                        } 
                    } else {
                        console.err("Geocoding service failed. Can't check if city exists in Canada.");
                    }
                }
            );
        }
    });
    
    $('#city').on('focus', function() {
        removeError($('#cityError'),$('#city')); 
    });
    
}

// Ensures that province is not empty, and is a valid province
function readProvinceField() {
    $('#province').on('blur', function() {
       findGeocodeAndMap();
       var canadianProvinces = ['ON', 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'PE', 'QC', 'SK', 'YT', 
                                'ONTARIO', "ALBERTA", "BRITISH COLUMBIA", "MANITOBA", "NEW BRUNSWICK", "NEWFOUNDLAND AND LABRADOR",
                                'NOVA SCOTIA', 'NORTHWEST TERRITORIES', 'NUNAVUT', 'PRINCE EDWARD ISLAND', 'QUEBEC', 'SASKATCHEWAN', 'YUKON'];
       var prov = ($.trim($('#province').val())).toUpperCase();
       if(checkIfEmptyField($('#province'))) {
           displayError($('#provinceError'), $('#province'), "Province is required");
       } else if(canadianProvinces.indexOf(prov) === -1) {
            displayError($('#provinceError'), $('#province'), prov + " is not a valid province");
       } 
    });
    $('#province').on('focus', function() {
        removeError($('#provinceError'),$('#province')); 
    });
}


// Ensures that postal code field is not empty, and is a valid canadian postal code
function readPostalCodeField() {
    $('#postalCode').on('blur', function() {
       findGeocodeAndMap();
       var postalCode = $.trim($('#postalCode').val()); 
       var postalCodePatt = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
       if(!checkIfEmptyField($('#postalCode'))) {
           if(!postalCode.match(postalCodePatt)) {
                displayError($('#postalCodeError'), $('#postalCode'), postalCode + " is not a valid canadian postal code");   
           } else {
               findGeocodeAndMap();
           }
       }
    });
    $('#postalCode').on('focus', function() {
        removeError($('#postalCodeError'),$('#postalCode')); 
    });
}


// When a user fills in any of teh fields: address, city, province, postalcode -- this function attempts to map the address
function findGeocodeAndMap() {
    var geocoder = new google.maps.Geocoder();
    var address = $('#address').val() + " " + $('#city').val() + " " + $('#province').val() + " " + $('#postalCode').val() + " ";
    geocoder.geocode({
        'address': address, 
        'componentRestrictions': {'country':'CA'}
    }, 
    function(results, status) {
        if (status === 'OK') {
            $('#googleMap').removeClass('hidden');
            $('#noMapAvailContainer').addClass('hidden');
            map = new google.maps.Map(document.getElementById('googleMap'));
            map.setCenter(results[0].geometry.location);
            map.setZoom(14);
            if($( "#showMap:checked" ).length > 0) {// checked
                var coordinates = map.getCenter().toString();
                coordinates = coordinates.substring(1,coordinates.length-1);
                $('#showMap').val(coordinates);
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


// Precondition: place has a geometry. Display place on google map
function displayMap(place) {
    $('#googleMap').removeClass('hidden');
    $('#noMapAvailContainer').addClass('hidden');
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
        var coordinates = map.getCenter().toString();
        coordinates = coordinates.substring(1,coordinates.length-1);
        $('#showMap').val(coordinates);
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
    
    if(!checkIfEmptyField($('#address'))) {
        removeError($('#addressError'), $('#address')); 
    }
    
    if(!checkIfEmptyField($('#city'))) {
        removeError($('#cityError'), $('#city')); 
    }
    
    if(!checkIfEmptyField($('#province'))) {
        removeError($('#provinceError'), $('#province')); 
    }
}


/* ----------------- IMAGE UPLOAD ----------------- */

// Disabled drag and drop functionality

function eventImageSetup() {
    
    var dropbox = document.getElementById("dropbox"),
        fileElem = document.getElementById("image"),
        fileSelect = document.getElementById("fileSelect"),
        fileRemove = document.getElementById("fileRemove");
        
    $(dropbox).height($('#imageBorder').height());
    
    fileSelect.addEventListener("click", function(e) {
        if (fileElem) {
          fileElem.click();
          e.preventDefault(); // to prevent submit
        }
    }, false);
    
    fileRemove.addEventListener("click", function(e) {
        e.preventDefault(); // prevent submit
        if(!$('#preview').hasClass('hidden')) { // If there is an image uploaded
            $('#preview').empty(); 
            $('#dropbox').removeClass('hidden');
            $('#preview').addClass('hidden');
            $('#fileSelect').text('Upload Image');
            resetFileInputField();
        }
        removeError($('#imageError'), $('#image'));
    });
}


function handleFiles(files) { 
 
 var file = files[0];
  
  var imageType = /^image\//;
  if (!imageType.test(file.type)) {
    $('#fileRemove').trigger('click');
    var msg = "The file you tried to upload is not an image. It will not be uploaded. Upload another image, or click 'remove image' to clear this error.";
    displayError($('#imageError'), $('#image'), msg); 
    resetFileInputField();
    return;
  } else if (file.size > MAX_FILE_SIZE) {
      $('#fileRemove').trigger('click');
      var uploadedFileSize = (file.size/1000000).toFixed(2);
      var maxFileSize = MAX_FILE_SIZE/1000000;
      var amsg = "Maximum file size is " + maxFileSize + ". Your file size is " + uploadedFileSize + " MB. Upload another image, or click 'remove image' to clear this error."; 
      displayError($('#imageError'), $('#image'), amsg); 
      resetFileInputField();
      return; 
  } else {
      removeError($('#imageError'), $('#image'));
      var img = document.createElement("img");
      img.onload = function() {
        adjustImageSize(img);
      };
      $('#dropbox').addClass('hidden');
      $('#preview').removeClass('hidden');
      $('#preview').empty();
      $('#preview').append(img);
      $('#fileSelect').text('Replace Image');
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function(event) {
          img.src = event.target.result;
      }
  }
}

$(window).on('resize', function() {
    var img = document.getElementById("uploadedImage");
    adjustImageSize(img);
});

function adjustImageSize(img) {
    if(img) {
        $(img).width("100%");
        $(img).height("auto");    
    }    
}

/* ----------------- DESCRIPTION ------------------ */

function eventDescriptionSetup() {
    
    $('#description').on('blur', function() {
        $('#descTip').addClass('hidden');
        if(checkIfEmptyField($('#description'))) {
            displayError($('#descriptionError'), $('#description'), "This field is required");
            document.getElementById('description').style.backgroundColor = 'rgba(248, 237, 237, 0.5)'; // hack -- bootstrap problems
        } else if ($('#description').val().length < MIN_DESC_LENGTH) {
            var msg = "Your description needs to be between " + MIN_DESC_LENGTH + " and " + MAX_DESC_LENGTH + " characters long. You currently have " + $('#description').val().length + " characters."; 
            displayError($('#descriptionError'), $('#description'), msg);
            document.getElementById('description').style.backgroundColor = 'rgba(248, 237, 237, 0.5)'; // hack -- bootstrap problems
        }
    });
    
    $('#description').on('focus', function() {
        $('#descTip').removeClass('hidden');
        showRemainingChars($('#descCharsLeft'), $('#description'), MAX_DESC_LENGTH); 
        removeError($('#descriptionError'), $('#description')); 
        document.getElementById('description').style.backgroundColor = 'transparent';
    });
    
    // Let user know how many characters remaining dynamically
    $('#description').on('keyup', function() {
        showRemainingChars($('#descCharsLeft'), $('#description'), MAX_DESC_LENGTH); 
    }); 
    
}

/* -------------------- WEBSITE ------------------- */

function eventWebsiteSetup() {
    $('#eventURL').on('blur', function() {
        if(!checkIfEmptyField($('#eventURL'))) {
            var eventURL = $('#eventURL').val(); 
            if(!isURL(eventURL)) {
                displayError($('#eventURLError'), $('#eventURL'), eventURL + " is not a valid URL" );
            }
        } 
    });
    $('#eventURL').on('focus', function() {
        removeError($('#eventURLError'), $('#eventURL'));
    });
}

/* ---------------- TICKET SALE URL --------------- */

function eventRegSetup() {
    costSetup();
    regURLSetup();
}

// Ensure user types in cost that makes sense
function costSetup() {
    $('#eventCost').on('blur', function() {
        if(checkIfEmptyField($('#eventCost'))) {
            displayError($('#eventCostError'), $('#eventCost'), "This field is required");
        } 
    });
    $('#eventCost').on('focus', function() {
        removeError($('#eventCostError'), $('#eventCost'));
    });
    
}

// Ensure user types in valid url
function regURLSetup() {
    $('#registerationURL').on('blur', function() {
        if(!checkIfEmptyField($('#registerationURL'))) {
            var regURL = $('#registerationURL').val(); 
            if(!isURL(regURL)) {
                displayError($('#registerationURLError'), $('#registerationURL'), regURL + " is not a valid URL" );
            }
        } 
    });
    $('#registerationURL').on('focus', function() {
        removeError($('#registerationURLError'), $('#registerationURL'));
    });
}

/* ---------- ORGANIZER DETAILS ------------------- */

function eventOrganizerSetup() {
    $('#organizerName').on('blur', function() {
        if(checkIfEmptyField($('#organizerName'))) {
            displayError($('#organizerNameError'), $('#organizerName'), "This field is required");
        }
    });
    $('#organizerName').on('focus', function() {
        removeError($('#organizerNameError'), $('#organizerName'));
    });
    $('#organizerEmail').on('blur', function() {
        if(checkIfEmptyField($('#organizerEmail'))) {
            displayError($('#organizerEmailError'), $('#organizerEmail'), "This field is required");
        } else {
            var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!pattern.test($('#organizerEmail').val())) {
                displayError($('#organizerEmailError'), $('#organizerEmail'), "Invalid Email Address");
            }
        }
    });
    $('#organizerEmail').on('focus', function() {
        removeError($('#organizerEmailError'), $('#organizerEmail'));
    });
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

// reset image
function resetFileInputField() {
    $('#image').wrap('<form>').closest('form').get(0).reset();
    $('#image').unwrap();
}

// errorDiv, inputField are JQuery Objects
// message is a string
// Method makes errorDiv visible, sets background color of inputField to 'errorBackground' and
// attaches message to errorDiv. It also stores the id of inputField parent section in the errors global array
function displayError(errorDiv, inputField, message) {
    errorDiv.empty(); 
    errorDiv.removeClass('hidden'); 
    inputField.addClass('errorBackground'); 
    errorDiv.append("<p>" + message + "</p>");
    pushToErrorsArray([inputField.parents('section')[0].id, inputField[0].id]);
    
}


// errorEntry is an array of two elements. The first element is an id of a section, the second element is an id
// of a particular input field. This method checks if the input field is in the errors array. If not, it adds it,
// If so, does nothing
function pushToErrorsArray(errorEntry) {
    var errorField = errorEntry[1]; 
    var isInErrorArray = false;
    errors.forEach(function(entry) {
       if(entry[1] == errorField) {
           isInErrorArray = true;
       } 
    });
    if(!isInErrorArray) {
        errors.push(errorEntry);
    }    
}


// errorDiv, inputField are JQuery objects
// Hides errorDiv, deletes error message stored in it, changes the background color of inputField to normal.
// Removes id of inputField parent section from global errors array
function removeError(errorDiv, inputField) {
    var index = getIndex(inputField); 
    if(index > -1) {
        errorDiv.empty();
        errorDiv.addClass('hidden');
        inputField.removeClass('errorBackground');
        errors.splice(index,1);
    }
}


// Returns index of inputField in errors array. Returns -1
// if inputField is not in errors array
function getIndex(inputField) {
    var i = 0;
    var index = -1;
    errors.forEach(function(entry) {
       if(entry[1] == inputField[0].id ) {
           index = i;
       } 
       i++;
    });
    return index; 
}


// Check if an input field contains spaces only. If so, deletes spaces
// so placeholder text appears and returns true. Otherwise retursn false. 
function checkIfEmptyField(inputField) {
    var userInput = $.trim(inputField.val());
    if(userInput.length === 0) {
        inputField.val(''); // Remove empty spaces from field
        return true;
    }
    return false;
}

//This function will update the event name tooltip with the number of
//characters remaining. Make sure the error message is hidden when user starts typing
// spanId and inputField are JQuery objects
function showRemainingChars(spanId, inputField, maxLength) {
    var numChars = inputField.val().length;
    var remaining = maxLength - numChars;
    spanId.text(remaining);
}


// Check if a URL is valid
// Regex Source
function isURL(str) {
  var pattern = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/); 
  return pattern.test(str);
}



