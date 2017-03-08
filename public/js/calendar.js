/* global $ */
/* global moment */


$( document ).ready(function() {
    initializeCalendar();
    addListeners();
});


/* ----------------- INITIALIZE ----------------- */

function initializeCalendar() {
    
    addListeners();
    
    if($('#dateToFind').val() == "") {
        var newURL = location.pathname + "?dateToFind=" + moment().format("YYYY-MM-DD");
        location.assign(newURL);
    }  else {
        var reqDateString = $('#dateToFind').val();
        var reqDate = moment(reqDateString);
        var day = reqDate.date(); 
        var month = reqDate.month();
        var monthName = moment.months()[month];
        var year = reqDate.year(); 
        setMonthLabel(monthName, year);
        fillInDays(day, month, year);
        //$('#dateToFind').attr("value", reqDate.format("YYYY-MM-DD"));
    }
}

/* ------------------ LISTENERS ----------------- */

function addListeners() {
    
    var today = moment();
    var month = today.month();
    var minDateMoment = moment((moment.months()[month] + " " + (today.year() - 1)), "MMMM YYYY");
    var maxDateMoment = moment((moment.months()[month] + " " + (today.year() + 1)), "MMMM YYYY");

    $('#next').unbind().on('mouseup', function() {
          var currMonthMoment = moment($('#month_label').text(), "MMMM YYYY");
          var nextMonthMoment = currMonthMoment.clone().add(1,'M');
          if(nextMonthMoment.isSameOrBefore(maxDateMoment, 'month')) {
              var monthName = moment.months()[nextMonthMoment.month()];
              var year = nextMonthMoment.year();
              resetCalendar();
              setMonthLabel(monthName, year);
              fillInDays(null, nextMonthMoment.month(), year);
          }
    });
    
    $('#prev').unbind().on('click', function() {
        var currMonthMoment = moment($('#month_label').text(), "MMMM YYYY");
        var prevMonthMoment = currMonthMoment.clone().subtract(1,'M');
        if(prevMonthMoment.isSameOrAfter(minDateMoment, 'month')) {
            var monthName = moment.months()[prevMonthMoment.month()];
            var year = prevMonthMoment.year();
            resetCalendar();
            setMonthLabel(monthName, year);
            fillInDays(null, prevMonthMoment.month(), year);
        }
    });
    
    $('.days').unbind().on('click', function(event) {
        // Change Style
        $('#selected').removeAttr('id');
        $(event.target).attr('id', 'selected');
        // Set date to find to a certain value
        var monthYear = $('#month_label').text();
        var day = $(event.target).text();
        var date = monthYear + " " + day;
        var mom = moment(date, "MMMM YYYY DD");
        $('#dateToFind').attr("value", mom.format("YYYY-MM-DD")); 
        // Manipulate URL
        var newURL = location.pathname + "?dateToFind=" + mom.format("YYYY-MM-DD");
        console.log(newURL);
        location.assign(newURL);
    });
    

}




/* -------------- HELPER FUNCTIONS -------------- */

// Sets the label to month year
function setMonthLabel(monthName, year) {
    $('#month_label').empty();
    var label = monthName + " " + year;
    $('#month_label').text(label.toUpperCase());
}

// Populates the calendar
function fillInDays(day, month, year) {
    var calendar = getCalendarArray(month, year);
    populateTableUsingArray(day, calendar);
}

// This function returns a double array corresponding to
// the days in month of year
function getCalendarArray(month, year) {
    
    var dayOfWeekStart = moment([year, month]).days(),
        daysInMonth = moment([year, month]).daysInMonth(),
        done = false,
        calendar = [],
        day = 1,
        i = 0;
    
    while(!done) {
        calendar[i] = [];
        for(var j=0; j<7; j++) {
            if(i==0) {
                if(j>= dayOfWeekStart) {
                    calendar[i][j] = day++;
                } 
            } else if(day > daysInMonth) {
                done = true;
            } else {
                calendar[i][j] = day++;
            }
        } 
        i++;   
    }
    return calendar;
}

// Array is a double array. This function populates the html table
// with the days as arranged in array. It also applies the class
// today to day
function populateTableUsingArray(today, array) {
    var numWeeks = array.length;
    for(var i=0; i<numWeeks; i++) {
        var numDaysInWeek = array[i].length;
        var id = "#w" + i;
        var tr = $(id);
        var x = (i === 0 ? (7-numDaysInWeek) : 0 );
        for(var j=x; j<numDaysInWeek; j++) {
            var td = tr.children()[j];
            var day = array[i][j];
            $(td).text(day);
            if( day === today ) {
                $(td).attr('id', 'selected');
            }
        }
    }
}


// This function clears the calendar, and removes the class today from
// any tr element
function resetCalendar() {
    var toEmpty = $('#day_container').find($('td'));
    toEmpty.empty();
    $('#selected').removeAttr('id');
    
}