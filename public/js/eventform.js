// CONSIDER ADDING TINYMCE FOR DESC
/* global $ */
/* global google */

var place; // move this to event section later
var picklist; 
var map;

/* ------------------- CONSTANTS ------------------ */

const MAX_INPUT_LENGTH = 100;
const MAX_DESC_LENGTH = 1500;

/* ----------------- Error Handling --------------- */

// This array keeps track of user input errors. It stores the element id associated with the error
// as a string
var errors = []; 


/* -------------- VALIDATE ON SUBMIT --------------- */

function validate(form) {
    errors.sort();
    if(errors.length > 0 ) {
        var idName = "#" + errors[0];
        if( $(idName).parents('section').length === 1 ) { // Dealing with nested sections
            idName = "#" + $(idName).parents('section')[0].id;
        }
        $(window).scrollTop($(idName).offset().top);
        return false;
    }
    // Do more validation here -- check for empty fields that were skipped during instant validation
    return false; // CHANGE TO RETURN TRUE LATER
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
    setMaxInputLength(MAX_INPUT_LENGTH, MAX_DESC_LENGTH);

});


 
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
        };
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
    $('#date').addClass('placeholderColor');
    
    $('#date').on('change', function() {
       if($('#date').val() == '') {
            $('#date').addClass('placeholderColor');
       } else {
             $('#date').removeClass('placeholderColor');
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
         removeError($('#dateError'), $('#date'));
    });
    
    
    // On blur, check for errors
    $('#date').on('blur', function() {
        
        var userInput = $.trim($('#date').val());
        var eventDate = new Date(userInput);
        var error = ""; 
        
        if(checkIfEmptyField($('#date'))) {
            error = "This field is Required"
        } else if(eventDate == "Invalid Date") {
            error = "Invalid Date. Date must be in the format yyyy-mm-dd"
        } else if( eventDate < today ) {
            error = "You cannot post past events"
        } else if (eventDate > (new Date(oneYearFromToday))) {
            error = "You can only post events happening within the next year"
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
        startErrorDiv = $('#startError'),
        endErrorDiv = $('#endError');
        
    var options = {
        timeFormat: 'h:mm p',
        dynamic: false,
        dropdown: false
    }
    
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
        $('#googleMap').addClass('hidden');
        $('#noMapAvailContainer').removeClass('hidden');
        removeLocationErrors(); 
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
            }, 500); 
        } 
    });
    
    // If user checks show map, set the value of checkbox to map geometry
    $('#showMap').on('click', function() {
        $('#showMapTip').toggleClass('hidden');
        if($( "#showMap:checked" ).length > 0) {// checked
            if(map) { // If map is defined
                $('#showMap').val(map.getCenter());
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
       findGeocodeAndMap()
       var postalCode = $.trim($('#postalCode').val()); 
       var postalCodePatt = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
       if(checkIfEmptyField($('#postalCode'))) {
            displayError($('#postalCodeError'), $('#postalCode'), "Postal Code is required");
       } else if(!postalCode.match(postalCodePatt)) {
            displayError($('#postalCodeError'), $('#postalCode'), postalCode + "is not a valid canadian postal code");   
       } else {
           findGeocodeAndMap();
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
    $('#locationDetails').removeClass('hidden');
    var locDHeight = $('#locationDetailsText').height() // set map height
    $("#mapContainer").height(locDHeight);

}

// Display google autocomplete search field and hide address details fields
function displayLocationSearchField() {
    hideAddressDetails();
    $('#locationSearch').removeClass('hidden'); // show search field
}

// Empty Google Autocomplete input field
// Hide Google Autocomplete input field
// Clear any errors related to google autocomplete
function hideLocationSearchField() {
    $('#location').val('');
    $('#locationSearch').addClass('hidden');
}


// Clear values from address details
// Remove any errors associated with address details
// clear map === MUST IMPLEMENT
function hideAddressDetails() {
    clearAddressValues();
    $('#locationDetails').addClass('hidden');
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
    $(dropbox).height($(imageBorder).height());
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
  img.id = "uploadedImage";
  img.file = file;
  img.onload = function() {
    adjustImageSize(img);
  };

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
            displayError($('#descError'), $('#description'), "This field is required");
            document.getElementById('description').style.backgroundColor = 'rgba(248, 237, 237, 0.5)'; // hack -- bootstrap problems
        }
    });
    
    $('#description').on('focus', function() {
        $('#descTip').removeClass('hidden');
        showRemainingChars($('#descCharsLeft'), $('#description'), MAX_DESC_LENGTH); 
        removeError($('#descError'), $('#description')); 
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
                displayError($('#wURLError'), $('#eventURL'), eventURL + " is not a valid URL" );
            }
        } 
    });
    $('#eventURL').on('focus', function() {
        removeError($('#wURLError'), $('#eventURL'));
    });
}

/* ---------------- TICKET SALE URL --------------- */

// Nothing here for now

/* ---------- ORGANIZER DETAILS ------------------- */

// Nothing here for now

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


// errorDiv, inputField are JQuery Objects
// message is a string
// Method makes errorDiv visible, sets background color of inputField to 'errorBackground' and
// attaches message to errorDiv. It also stores the id of inputField parent section in the errors global array
function displayError(errorDiv, inputField, message) {
    errorDiv.empty(); // clear previous errors
    errorDiv.removeClass('hidden'); // Make Error visible
    inputField.addClass('errorBackground'); // Change background color of associated inputfield 
    errorDiv.append("<p>" + message + "</p>"); // Display Error Message
    errors.push(inputField.parents('section')[0].id);
}


// errorDiv, inputField are JQuery objects
// Hides errorDiv, deletes error message stored in it, changes the background color of inputField to normal.
// Removes id of inputField parent section from global errors array
function removeError(errorDiv, inputField) {
    var index = errors.indexOf(inputField.parents('section')[0].id);
    if(index > -1) {
        errorDiv.empty();
        errorDiv.addClass('hidden');
        inputField.removeClass('errorBackground');
        errors.splice(index,1);
    }
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
// source: http://bit.ly/2jE77zz
function isURL(str) {
  console.log("Inside is URL");
  var pattern = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/); 
  return pattern.test(str);
}

/* Removes hidden class from errorDiv
/* Adds a p tag as a child of errorDiv, with message
 */
/*function displayError(errorDiv, message) {
        console.log("in display error 2");
    errorDiv.empty(); // clear previous errors
    safeRemoveClass(errorDiv, 'hidden');
    errorDiv.append("<p>" + message + "</p>");
}*/

/* Adds hidden class to errorDiv
/* Removes all children from errorDiv
 */
/*function removeError(errorDiv) {
    errorDiv.empty();
    safeAddClass(errorDiv,'hidden');
}*/

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


