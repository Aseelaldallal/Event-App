/* global adjustImageSize */
/* global $ */
/* global moment */
/* global findGeocodeAndMap */
                   
/* ---------------- DOCUMENT.READY ---------------- */


$(document).ready(function() {
    
    // If the event has an associated image, displays the image in the sidebar
    var imageSource = $('#imageSource').val();
    if(imageSource !== '') {
        var myImg = document.createElement("IMG");
        myImg.src = imageSource; 
        myImg.name = "previewImage";
        myImg.id = "previewImage";
        console.log("My Image: ", myImg); 
        adjustImageSize(myImg);
        $('#preview').append(myImg);
    }
    
    // Display Date in date input field
    var eventDateString = $('#eHiddenDate').val();
    var input = $('<input>');
    input.attr("name", "date");
    input.attr("id", "date");
    input.attr("type", "date");
    input.attr("class", "form-control req");
    input.attr("aria-describedby", "dateIcon");
    input.attr("value", moment.utc(eventDateString, 'ddd MMM DD YYYY HH:mm:ss ZZ').format('YYYY-MM-DD'));
    $('#theDateGroup').append(input);

    // Show map    
    findGeocodeAndMap(); 
    if( $('#showMap').val() != '') {
        $('#showMap').prop('checked', 'true'); 
    }

});