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

async function printImage(printer, image) {

  console.log(chalk.green('Start printing image...'));

  try {
    printer.clear();
    printer.alignCenter();
    printer.println("Bakken & Bæck");
    printer.println("Van Diemenstraat 38");
    printer.println("1013 NH Amsterdam");
    printer.println("~~~~~~~~~~~");
    printer.println("You're awesome! :)");

    await printer.printImage(image);

    printer.cut();
    // printer.clear();
    printer.execute();

    console.log(chalk.green('Image printed'));
  } catch(error) {
    console.log(chalk.red('Error printing image', error));
  }
}

function sendToServer(client, filePath) {
  client.assets.upload('image', fs.createReadStream(filePath), {
    filename: path.basename(filePath)
  }).then(_imageAsset => {
    console.log(chalk.green('Asset uploaded to Sanity'));
  });
}

async function setupPrinter() {
  const printer = new ThermalPrinter({
    type: types.EPSON,
    interface: "tcp://192.168.1.205:9100"
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
  // const client = setupSanity();
  const printer = await setupPrinter();

  // Initialize watcher.
  const watcher = chokidar.watch(process.env.FOLDER, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('add', async (path) => {
    console.log(chalk.green(`file added at path: ${path}`));

    await printImage(printer, path);
    // sendToServer(client, path);
  });
}

setup();