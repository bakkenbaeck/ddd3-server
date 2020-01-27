import chalk from "chalk";
import { printer as ThermalPrinter, types } from "node-thermal-printer";

type CommandString = "CUT";

interface Command {
  command: CommandString;
  payload: any;
}

const getCommand = (
  printer: ThermalPrinter,
  command: CommandString
) => {
  const COMMANDS = {
    CUT: (_payload: any) => printer.cut(),
    PRINT_IMAGE: async (image: string) => printer.printImage(image)
  };

  return COMMANDS[command];
};

export default class Printer {
  private address: string;
  private printer: ThermalPrinter;

  constructor(address: string) {
    this.address = address;
  }

  async executeCommands(commands: Command[]) {
    if (commands == null || !Array.isArray(commands) || commands.length === 0) {
      throw new Error("Provide at least one command");
    }

    await Promise.all(
      commands.map(async (command) => {
        try {
          await this.executeCommand(command);
        } catch (err) {
          throw new Error(`Error executing command: ${command.command} with error ${err}`);
        }
      })
    );

    return this.printer.execute();
  }

  async executeCommand(comm: Command) {
    const { command, payload } = comm;

    if (command == null) {
      throw new Error("Provide a command");
    }

    const c = getCommand(this.printer, command);

    if (c == null) {
      throw new Error("Command not found.");
    }

    c(payload);
  }

  async connect() {
    const printer = new ThermalPrinter({
      type: types.EPSON,
      interface: this.address
    });

    const isConnected = await printer.isPrinterConnected();

    if (isConnected) {
      console.log(chalk.green("Printer connected."));
    } else {
      console.log(chalk.red("Printer not connected. Try again."));
    }

    this.printer = printer;
  }
}
