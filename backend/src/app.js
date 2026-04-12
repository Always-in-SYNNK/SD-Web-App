//INITIALIZES THE EXPRESS APP, SETS UP MIDDLEWARE, AND DEFINES THE BASE ROUTE FOR AUTHENTICATION

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); //ALL ROUTES IN authRoutes WILL BE PREFIXED WITH /api/auth

module.exports = app;