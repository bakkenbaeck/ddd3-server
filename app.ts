import dotenv from "dotenv";
import express, { Request, Response } from "express";
import chalk from "chalk";
import bodyParser from "body-parser";
import boom from "express-boom";
import Printer from "./lib/printer";

const PORT = 3000;

const printer = new Printer("tcp://192.168.1.205:9100");

printer.connect().then((_p) => {
  chalk.green("Printer setup done.");
});

const app = express();

// Add middleware
app.use(bodyParser.json());
app.use(boom());

app.post('/printer', async (req: Request, res: Response) => {
  const { commands } = req.body;

  if (printer == null) {
    res.boom.badImplementation('Printer not ready. Try again later');
  }

  try {
    await printer.executeCommands(commands);
  } catch(err) {
    return res.boom.badRequest(`Error executing commands: ${err}`)
  }

  res.send({
    message: "Commands executed",
  });
});

app.listen(PORT);