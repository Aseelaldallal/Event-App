# Event-App


## Summary
Web app that allows users to view and post events happening in Canada

**App Link:** https://eventfulcanada.herokuapp.com/

## Stack and Features

**Stack:** NodeJS, Express, MongoDB

**Features:**
- RestFUL Routing with express and mongoose
- Authentication using Passport.js
- Image storage via Amazon S3
- Google Maps API to render event location
- Google Places API to verify addresses
- Deployed on Heroku
- Database hosted on mLab
- EJS for templating
- Responsive Design using Bootstrap

## Notes on How the App Was Made

This is the first web app I made. I thought I'd outline my thought process here, in case you have questions about decisions I made when coding. This app is a learning exercise; it wasn't intended for public use. I'd appreciate your feedback!

**The purpose of creating this app was for me to get familiar with the following**

- Front End Data Validation
- Back End Data Validation
- Image Upload and Storage
- Google Places and Google Maps API
- Populating DB with Dummy Data

### Front End Data Validation ###

Try to post an event or edit an event to see front-end data validation in action.

Objective: Check that
- User input is valid
- User recieves error messages in a visually appealing manner
- User recieves error messages BEFORE submitting the form

Coding this was pretty straightforward. The main challenge was deciding what is and what isn't valid user input. 

### Back-End Data Validation ###

For the front end, I wrote my own validation methods. For the backend, I decided to use a validator called indicative. I really liked its simplicity. I could have used the same frontend code for backend validation, but decided to use indicative because I wanted to experiment with it. Having different code validate the same input is more robust (but increases the amount of code, so might not be a good idea)
Regarding the second point, I did find two bugs in the indicative library. Basically frontend validation for date was passing, but the backend validation was failing. I realized there was a bug in how indicative was comparing dates (fixed it).

### Image-Upload ###

**Frontend:**

I wanted to imitate BlogTo's image upload functionality. I could have used Dropzone.js or another library (and it might have been better to do so), but I wanted to write the code from scratch (just as a learning exercise).

**Backend:**

I deployed my app to Heroku, and Heroku doesn't allow for image storage. After some research, I decided to use Amazon S3 for image storage. I used the npm package multer-s3 to handle image upload to Amazon S3. It was pretty straightforward.

### Google Places and Google Maps API ###

Try to post a new event, and enter a Canadian address in the "Search for your address here" text field.

**Goals:**

- Use google places autocomplete to suggest an address in Canada
- Have the address returned by google broken down into seperate fields (venue name, address, unit number, city, province, postal code)
- Have a map corresponding to the user's address input appear
- Having the map update itself each time the user changes the address, city, province or postal code field

How well this works depends on the quality of data google has. I considered using Canada Post's API since I assumed they'd have better canadian address verification functionality, but since its not free, I decided to stick with google places API.

### Writing Scripts to Populate DB ###

When I was done making the app, I had to choose between 3 options:

1. Have no data in the db
2. Manually enter hundreds of events
3. Write a script to create hundreds of events in the db
Obviously, I opted for the third option

The main challenge was creating random valid Canadian Addresses. Although I could use random text for event title, description, url etc. (see faker) , I needed to use actual canadian addresses (in order for the google Maps functionality to work). Hence I had to write a script that uses google places API to generate random valid canadian addresses.

--- 
Improvements:
Using AJAX! If you navigate to the front page right now, you'll see that each time you click a calendar date, the page refreshes. 
Using a front end framework (React or Angular).
Adding functionality like search by city and event rating
