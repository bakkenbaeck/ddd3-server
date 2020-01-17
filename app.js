"use strict";

import dotenv from "dotenv";
import chalk from "chalk";
import chokidar from "chokidar";
import { printer as ThermalPrinter, types } from "node-thermal-printer";
import sanityClient from '@sanity/client'
import fs from 'fs';
import path from 'path';

// Configure Dotenv to read environment variables from .env file
// automatically
dotenv.config();

function printImage(printer, image) {
  console.log(chalk.green('Start printing image...'));
}

function sendToServer(client, filePath) {
  client.assets.upload('image', fs.createReadStream(filePath), {
    filename: path.basename(filePath)
  }).then(_imageAsset => {
    console.log(chalk.green('Asset uploaded to Sanity'));
  });
}

async function setupPrinter() {
  let printer = new ThermalPrinter({
    type: types.EPSON,
    interface: process.env.PRINTER_ADDRESS,
    characterSet: 'PC858_EURO',
    removeSpecialCharacters: false,
    lineCharacter: "=",
    options:{
      timeout: 5000
    }
  });

  let isConnected = await printer.isPrinterConnected();

  if (isConnected) {
    console.log(chalk.green('Printer connected.'));
  } else {
    console.log(chalk.red('Printer not connected. Try again.'));
  }

  return printer;
}

function setupSanity() {
  return sanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN
  });
}

async function setup() {
  const client = setupSanity();
  const printer = setupPrinter();

  // Initialize watcher.
  const watcher = chokidar.watch(process.env.FOLDER, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('add', (path) => {
    console.log(chalk.green(`file added at path: ${path}`));

    printImage(printer, path);
    sendToServer(client, path);
  });
}

setup();