/* global moment */
/* global google */
/* global $ */
                   
/* ---------------- DOCUMENT.READY ---------------- */


$(document).ready(function() {
    
    adjustBorder();
    
    $(window).on('resize', function() {
        adjustBorder();
    });    
    
    // Display date
    var eventDateString = $('#hiddenDate').val();
    var mom = moment.utc(eventDateString, 'ddd MMM DD YYYY HH:mm:ss ZZ'); 
    $('#show-eventDate').text(mom.format('dddd, MMMM DD YYYY'));
    
    // If text overextends container (because user failed to input spaces), break text
    var textToBreak = $('.possibleLongInput');
    for (var i=0; i<textToBreak.length; i++) {
    	var htmlelem = $(textToBreak)[i];
        var textWidth = $(htmlelem).width();
        var parent = $(htmlelem).parent();
        var parentWidth = $(parent).width();
        if(textWidth > parentWidth) {
        	$(parent).css("word-break", "break-word");
    	}
    }
    
    // Adjust Map
    var mapLatLngString = $('#mapCenter').val();
    if(mapLatLngString != undefined) {
        var latLngRawArray = mapLatLngString.split(",");
        var lat = latLngRawArray[0];
        var lng = latLngRawArray[1];
        var latlngObj = new google.maps.LatLng(lat, lng);
        var map = new google.maps.Map(document.getElementById('showMapp'));
        map.setCenter(latlngObj);
        map.setZoom(15);
        var marker = new google.maps.Marker({
            position: latlngObj,
            map: map
        });
    }
});

/* --------------- HELPER FUNCTIONS --------------- */


// When the screen is large (bootstrap: 1200px +), ensure there is a border
// between sidebar and contentArea. By default, the border is drawn on the left
// of the contentArea. This method checks if the sidebar is longer than the contentArea.
// If so, removes the border from contentArea, and draws it to the right of sidebar.
function adjustBorder() {
    if($('.mediaQueryTesterMS').css('float') == "right") {
        var sidebarH = $('.sidebar').height();
        var contentH = $('.contentArea').height();
        if(sidebarH > contentH) {
            $('.sidebar').css("border-right", "3px solid midnightblue");
            $('.contentArea').css("border-left", "none");
        }
    } else {
        $('.sidebar').css("border-right", "none"); // No border when screen is medium or less
    }
}