


$(document).ready(function() {
    addEventNameInputValidators(); 
    addDateInputValidators(); 
    configureTimePickers();
    setupGooglePlacesAutocomplete();


});


/* Ensures user enters event name */
function addEventNameInputValidators() {
    $('#eventName').on('blur', function() {
        var theName =  $('#eventName').val();
        if(theName == "") {
            $("#nameError").removeClass("hidden");
            $("#nameError").empty();
            $("#nameError").append("<p> Event title is required </p>");
        } else {
            $("#nameError").addClass("hidden");
        }
    });
}

/* Ensure user enters valid date 
 * A valid date has the format yyyy-mm-dd
 * A valid date cannot occur in the past
 * A valid date cannot occur more than one year from now
 */
function addDateInputValidators() {
    setMinMaxDate(); // add min, max attributes to html
    $('#date').on('blur', function() {
        var error = "";
        var date = new Date($('#date').val());
        var today = new Date((Date.now()));
        var maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        if (date == "Invalid Date") {
            error = "Enter a valid date" ;
        } else if(date < today) {
            error = "Your event is in the past? Really?"
        } else if(date > maxDate) {
            error = "You can only post events happening within the next year"
        }
        console.log(error);
        displayErrors($('#dateError'), error);
    });
}

/* Set min and max attributes for html date type.
 * min is today's date, max is one year from today's date
 */
function setMinMaxDate() {
    var today = new Date(Date.now());
    var year = today.getFullYear();
    var nextYear = year + 1;
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var todayDate = year + "-" + month + "-" + day;
    var oneYearFromToday = nextYear + "-" + month + "-" + day;
    $('#date').attr("min", todayDate);
    $('#date').attr("max", oneYearFromToday);
}


/* Create timepickers and ensure user enters valid times
 * End time must be after start time. 
 */
function configureTimePickers() {
    createTimePickers();
    validateTimeInput();
    

}

/* Create timepickers
 * Src: http://timepicker.co/
 */
function createTimePickers() {
    var options = {
        timeFormat: 'h:mm p',
        dynamic: false,
        dropdown: false
    }
    $('#starttime').timepicker(options);
    $('#endtime').timepicker(options);
}



function validateTimeInput() {
    
    $('#starttime').on('blur', function() {
        var start = new Date("January 1 2016 " + $('#starttime').val());
        error = doChecks(start);
        displayErrors($("#startError"), error);
    });
    
    $('#endtime').on('blur', function(){
        var end = new Date("January 1 2016 " + $('#endtime').val()); 
        error = doChecks(end);
        displayErrors($('#endError'), error);
    });
    
    
  
}


function doChecks(blurInput) {
    var error = "";
    var startTime = $('#starttime').val();
    var endTime = $('#endtime').val();
    console.log("blurInput: " , blurInput);
    console.log("startTime: ", startTime);
    console.log("endTime: ", endTime);
    if( blurInput == "Invalid Date") {
        error = "Please enter a valid time in the format hh:mm"
    } else if (startTime != "" && endTime != "") { // If both fields are entered
        startTime = new Date("January 1 2016 " + startTime);
        endTime = new Date("January 1 2016 " + endTime);
        console.log("startTime: ", startTime);
        console.log("endTime: ", endTime);
        if( startTime != "Invalid Date" && endTime != "Invalid Date") {
            if(startTime.getTime() === endTime.getTime()) {
                error = "Your event can't last for 0 seconds";
            } else if ( endTime < startTime ) {
                console.log("end: " + endTime);
                console.log("start: " + startTime);
                console.log("Check: ", endTime > startTime);
                error = "Your event can't start after it ends!"
            }
        }
    }
    return error;
}

function displayErrors(element, error) {
    element.empty();
    if(error != "") {
        element.removeClass("invisible");
        element.append("<p>" + error + "</p>");
    } else {
        element.addClass("invisible");
    }
    console.log("The Length: ", $('#dateTimeValidate').find('*').length);
    if($('#dateTimeValidate').find('*').length <= 3) {
        console.log("Less than 3, so no errors");
        if(!$('#dateTimeValidate').hasClass("hidden")) {
            $('#dateTimeValidate').addClass("hidden");
        }
    } else {
        if($('#dateTimeValidate').hasClass("hidden")) {
            $('#dateTimeValidate').removeClass("hidden");
        }
    }
}















/* Configuring Google Autocomplete */
function setupGooglePlacesAutocomplete() {
      var ac = new google.maps.places.Autocomplete($('#fullAddress')[0]);
      ac.addListener('place_changed', function() {
          var place = ac.getPlace();
          console.log(place.formatted_address);
          console.log(place.url);
      });
      // add "Can't find Address?" link
      $('#fullAddress').on('click', function() {
            var picklist = $('.pac-container');
            var link = picklist.find('a');
            if(link.length === 0) {
                picklist.append("<div class='pac-item'><a id='addressNotFound'><div class='pac-icon'></div> Can't find address?</a></div>");
            }
      });
      //Show alternative address section if "can't find address" clicked
      $(document).on('mousedown', '#addressNotFound',function() {
          console.log("clicked!"); 

      });
}










