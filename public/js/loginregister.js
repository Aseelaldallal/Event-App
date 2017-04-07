
/* global $ */

// If there are no errors (username, password entered), return true
// return false otherwise
function shouldSubmit(form) {
    // Deal with autofill password
    if(!checkIfEmptyField($('#password'))) {
        removeError($('#passwordError'), $('#password'));
    }
    
    if($('#usernameError').hasClass("hidden") && $('#passwordError').hasClass("hidden")) {
        return true;
    }
    return false;
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

// errorDiv, inputField are JQuery objects
// Hides errorDiv, deletes error message stored in it, changes the background color of inputField to normal.
// Removes id of inputField parent section from global errors array
function removeError(errorDiv, inputField) {
    errorDiv.empty();
    errorDiv.addClass('hidden');
    inputField.removeClass('errorBackground');
}



 $(document).ready(function() {
     
    // On Focus: Remove Errors, Display Tooltip
    $('#username').on('focus', function() {
        removeError($('#usernameError'), $('#username'));
    });
    
    // On Blur, remove tooltip. If error, display error.
    $('#username').on('blur', function() {
        if(checkIfEmptyField($('#username'))) {
            displayError($('#usernameError'), $('#username'), "Username is required");
        }
    });
     
         // On Focus: Remove Errors, Display Tooltip
    $('#password').on('focus', function() {
        removeError($('#passwordError'), $('#password'));
    });
    
    // On Blur, remove tooltip. If error, display error.
    $('#password').on('blur', function() {
        if(checkIfEmptyField($('#password'))) {
            displayError($('#passwordError'), $('#password'), "Password is required");
        }
    });
    
 });
