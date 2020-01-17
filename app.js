"use strict";

import dotenv from "dotenv";
import chalk from "chalk";
import chokidar from "chokidar";
import { printer as ThermalPrinter, types } from "node-thermal-printer";
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import path from 'path';

// Configure Dotenv to read environment variables from .env file
// automatically
dotenv.config();

function printImage(printer, image) {
  console.log(chalk.green('Start printing image...'));
}

function sendToServer(filePath) {
  const fileName = path.basename(filePath);

  const client = new S3({
    params: {
      Bucket: process.env.S3_BUCKET
    }
  });

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(chalk.red(`Could not read file: ${err}`));
      return;
    }

    const params = {
      Key: fileName,
      Body: data,
    };

    client.upload(params, (err, _data) => {
      if (err) {
        console.log(chalk.red(`Error uploading file to S3: ${err}`));
      } else {
        console.log(chalk.green(`File successfully uploaded to S3!`));
      }
    });
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

function setupAWS() {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
}

async function setup() {
  setupAWS();
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
    sendToServer(path);
  });
}

setup();