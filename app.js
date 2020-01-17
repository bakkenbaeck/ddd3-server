"use strict";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import chalk from "chalk";

const app = express();

// Configure Dotenv to read environment variables from .env file
// automatically
dotenv.config();

// Define json body reader
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname, { dotfiles: "allow" }));

// Enable proxy x-Forwadded-*
app.enable("trust proxy");

// Enables CORS
app.use(cors());

// Set port
app.set("port", process.env.PORT || 5000);

// Initialize server
app.listen(app.get("port"), err => {
  if (err) {
    console.log(chalk.red(err.message));
  } else {
    console.log(chalk.green(`Server is running on port ${app.get('port')}`));
  }
});