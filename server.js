// Load environment variables from .env file
require("dotenv").config();
// Import required modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Define the port for the server to listen on
const port = process.env.PORT || 8000; // Define the port for the server to listen on

// Import user routes
const userRoutes = require("./app/routes/user.routes");
const productRoutes = require("./app/routes/product.routes");
const cartRoutes = require("./app/routes/cart.routes");

// Enable CORS for all routes
app.use(cors());

// Parse requests with content-type - application/json
app.use(bodyParser.json());

// Parse requests with content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Define a basic route
app.get("/", (req, res) => {
  res.send("Welcome to our furniture website!");
});

// Use routes for all endpoint
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
