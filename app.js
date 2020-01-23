"use strict";

import dotenv from "dotenv";
import chalk from "chalk";
import chokidar from "chokidar";
import { printer as ThermalPrinter, types } from "node-thermal-printer";
import sanityClient from '@sanity/client'
import fs from 'fs';
import path from 'path';
import Jimp from 'jimp2';

// Configure Dotenv to read environment variables from .env file
// automatically
dotenv.config();

async function printImage(printer, image, counter) {

  console.log(chalk.green('Start printing image...'));

  // const date = new Date();

  // date.


  try {
    printer.clear();

    printer.alignCenter();
    printer.println("Bakken & Bæck");
    printer.println("Van Diemenstraat 38");
    printer.println("1013 NH Amsterdam");

    printer.alignRight();

    printer.newLine();

    printer.println(`23.01.20 20:53`);
    printer.println(`#${counter}`);

    printer.newLine();

    printer.alignCenter();
    printer.println("* * * * * * * * * *");

    printer.invert(false);

    // printer.setTypeFontB();
    // printer.setTextSize(1,1);

    printer.newLine();

    printer.alignLeft();
    printer.println("“The world is suffering from a dark and silent phenomenon known as ‘digital decay’ – anything stored in computerized form is vulnerable to breakdown and obsolescence.”");

    printer.newLine();

    printer.alignRight();
    printer.println("— Bruce Sterling (2004)");

    printer.newLine();

    printer.alignCenter();

    printer.newLine();

    await printer.printImage(image);

    printer.newLine();
    printer.newLine();

    printer.println("No refunds bye");

    printer.newLine();

    await printer.printImage("./ddd.png");

    printer.cut();
    // printer.clear();
    printer.execute();

    console.log(chalk.green('Image printed'));
  } catch(error) {
    console.log(chalk.red('Error printing image', error));
  }
}

function transformImage(sourceFile) {
  const transformedPath = sourceFile.replace('print', 'finalprint');

  return new Promise(resolve => {
    Jimp.read(sourceFile, (err, larger) => {
      larger.resize(480, 1200);
      Jimp.read(sourceFile, (err, orig) => {
        larger.composite(orig, 0, 0);
        Jimp.read(sourceFile, (err, flip) => {
          flip.mirror(false, true);
          larger
            .composite(flip, 0, 600)
            .dither565()
            .write(transformedPath, () => {
              resolve(transformedPath);
            });
        });
      });
    });
  });
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

  let counter = 10001;

  // Initialize watcher.
  const watcher = chokidar.watch(process.env.FOLDER, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('add', async (path) => {
    console.log(chalk.green(`file added at path: ${path}`));

    const newPath = await transformImage(path);

    await printImage(printer, newPath, counter);

    counter++;
    // sendToServer(client, path);
  });
}

setup();