const express = require('express'); // Import the express module
const router = express.Router(); // Create a new router instance
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require('../models/user.models'); // Import the User model

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find(); // Find all users
        res.status(200).json(users); // Respond with the users in JSON format
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
});

// Get user by ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Find a user by ID

        // if id is wrong return user not found message
        if (!user) {
            return res.status(500).json({ message: "user not found" });
        }
        res.status(200).json(user); // Respond with the user in JSON format
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
});

// Validation middleware for creating a new user
const validateUser = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];


// Create a new user
router.post("/register", validateUser, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
    }

    try {
        // hash the password
        bcrypt
            .hash(req.body.password, 10)
            .then((hashedPassword) => {
                // create a new user instance and collect the data
                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: hashedPassword,
                });

                // save the new user
                user.save()
                    // return success if the new user is added to the database successfully
                    .then((result) => {
                        res.status(200).send({
                            message: "User Created Successfully",
                            result,
                        });
                    })
                    // catch error if the new user wasn't added successfully to the database
                    .catch((error) => {
                        res.status(500).send({
                            message: "Error creating user",
                            error: error.message,
                        });
                    });
            })
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
});


router.post("/login", (request, response) => {
    // check if email exists
    User.findOne({ email: request.body.email })

        // if email exists
        .then((user) => {
            // compare the password entered and the hashed password found
            bcrypt
                .compare(request.body.password, user.password)

                // if the passwords match
                .then((passwordCheck) => {
                    // check if password matches
                    if (!passwordCheck) {
                        return response.status(400).send({
                            message: "Passwords does not match",
                            error,
                        });
                    }

                    //   create JWT token
                    const token = jwt.sign(
                        {
                            userId: user._id,
                            userEmail: user.email,
                        },
                        "RANDOM-TOKEN",
                        { expiresIn: "24h" }
                    );

                    //   return success response
                    response.status(200).send({
                        message: "Login Successful",
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        token,
                    });
                })
                // catch error if password does not match
                .catch((error) => {
                    response.status(400).send({
                        message: "Passwords does not match",
                        error: error.message,
                    });
                });
        })
        // catch error if email does not exist
        .catch((error) => {
            response.status(404).send({
                message: "Email not found",
                error: error.message,
            });
        });
});

// Update user by ID
router.put("/update/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Update a user by ID

        // if id is wrong return user not found message
        if (!user) {
            return res.status(404).json({ message: "User not found for updating" });
        }
        res.status(200).json(user); // Respond with the updated user in JSON format
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
});

// Delete user by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id); // Delete a user by ID

        // if id is wrong return user not found message
        if (!user) {
            return res.status(404).json({ message: "user not found for deletion" });
        }
        res.status(200).json({ message: "user deleted successfully" }); // Respond with the deleted user in JSON format
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle errors
    }
});

module.exports = router; // Export the router