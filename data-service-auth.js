/*************************************************************************
* BTI325– Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Varun Kakkar Student ID: 124524216 Date: 11-12-2022
*
* Your app’s URL (from Cyclic) : https://comfortable-yak-earrings.cyclic.app
*
*************************************************************************/
const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');
//mongoDB URI
var uri = "mongodb+srv://vkakkar:Rinkysoft1@vkakkar.xizpnw0.mongodb.net/?retryWrites=true&w=majority";

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{ "dateTime": Date, "userAgent": String }]
});
//---------------------------------------------------------------------------------------------------------------------------------------------
let User
module.exports.initialize = function () {return new Promise((resolve, reject) => {let dataBase = mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
            if (err) {reject(err);}
            else {User = dataBase.model("users", userSchema);
                console.log("Connection --> mongoDB: Successful");
                resolve();}});
    })
}
//---------------------------------------------------------------------------------------------------------------------------------------------
module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {if (userData.password == "" || userData.password.trim().length == 0 || userData.password2 == "" || userData.password2.trim().length == 0) {reject("Error: Cannot leave username empty or white spaces");}
        else if (userData.password != userData.password2) {reject("Error: Passwords do not match");}
        else {bcrypt.hash(userData.password, 10).then((hash) => {userData.password = hash;
                let newUser = new User(userData);
                newUser.save((err) => {if (err) {
                        if (err.code === 11000) {reject("User Name already taken");}
                        else {reject("There was an error creating the user: " + err);}
                    }
                    else {resolve();}})}).catch(() => {reject("There was an error encrypting the password")})
        }
    })
}
//---------------------------------------------------------------------------------------------------------------------------------------------
module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {User.findOne({ userName: userData.userName }).exec().then((foundUser) => {
                if (userName = "") {reject("Unable to find user: " + userData.userName)}
                else {bcrypt.compare(userData.password, foundUser.password).then((res) => {
                        if (res == true) {foundUser.loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                            foundUser.update({ userName: foundUser.userName },{ $set: { loginHistory: foundUser.loginHistory } },).exec().then(() => { resolve(foundUser) }).catch((err) => {
                                reject("There was an error verifying the user: " + err);})}
                        else {reject('Incorrect Password for user: '+userData.userName);}})
                }}).catch(() => {reject("Unable to find user: " + userData.userName);})
    })
}
//---------------------------------------------------------------------------------------------------------------------------------------------
