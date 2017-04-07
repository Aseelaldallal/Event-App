
/* global $ */
/* global moment */
/* global location */

/* ---------------- DOCUMENT.READY ---------------- */


$(document).ready(function() {
    
    // Adjust border separating sidebar from main content
    adjustEventBoxImageHeight();

    // Add Listener for image height
    $(window).on('resize', function() {
        adjustEventBoxImageHeight();
    });    
    
    $('#futureEvents').on('change', function() {
        if($('#futureEvents').is(':checked')) {
            displayFutureEvents();
        } else {
            displayPastEvents();
        }
        
    })
    
});



/* --------------- HELPER FUNCTIONS --------------- */


// If the image in event box is adjacent to the text, make sure its the same height as the 
// text. Otherwise, keep its height at 200px.
function adjustEventBoxImageHeight() {
    if($('.mediaQueryTesterML').css('float') == "right") {
        $('.eventBoxImg').height($('.eventBoxContentText').height());
        $('.emptyImage').height($('.eventBoxContentText').height());
    } else {
        $('.eventBoxImg').height("200px");
        $('.emptyImage').height("200px");
    }
}

// Show future events
function displayFutureEvents() {
    var newURL = location.pathname + "?futureEvents=" + moment().format("YYYY-MM-DD"); 
    location.assign(newURL);
    
}

// Show past events
function displayPastEvents() {
    location.assign(location.pathname);
}