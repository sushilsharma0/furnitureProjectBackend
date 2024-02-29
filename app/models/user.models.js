const mongoose = require("mongoose");

// Defines the user schema and model using Mongoose for MongoDB
const userSchema = new mongoose.Schema({
    name: { // Defines the name field as a required string
        type: String,
        required: true
    },
    email: { // Defines the email field as a required, unique, and trimmed string
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: { // Defines the password field as a required string with a minimum length of 8 characters
        type: String,
        required: true,
        minlength: 8
    }
}, { timestamps: true }); // Enables timestamps for the user model

const User = mongoose.model('User', userSchema); // Creates the User model based on the userSchema

module.exports = User; // Exports the User model
