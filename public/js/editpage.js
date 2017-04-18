/* global adjustImageSize */
/* global $ */
/* global moment */
/* global findGeocodeAndMap */
                   
/* ---------------- DOCUMENT.READY ---------------- */


$(document).ready(function() {
    
    // If the event has an associated image, displays the image in the sidebar
    var previousImage = $('#previousImage');
    if(previousImage.val() !== '') {
         $('#dropbox').addClass('hidden');
         $('#preview').removeClass('hidden');
         var img = document.createElement("img");
         img.src = "https://s3.ca-central-1.amazonaws.com/eventfulcanada/" + previousImage.val();
         $('#preview').append(img);
         $('#fileSelect').text('Replace Image');
         adjustImageSize(img);
    }
    
    // When user clicks removeImage, set ImageRemoved to True
    $('#fileRemove').on('click', function() {
        $('#imageRemoved').val("true");
    })

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