import chalk from "chalk";
import { printer as ThermalPrinter, types } from "node-thermal-printer";

type CommandString = "CUT" | "PRINT_IMAGE";

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
    CLEAR: (_payload: any) => printer.clear(),
    BEEP: (_payload: any) => printer.beep(),
    UPSIDE_DOWN: (payload: boolean) => printer.upsideDown(payload),
    PARTIAL_CUT: (_payload: any) => printer.partialCut(),
    PRINT_IMAGE: async (image: string) => printer.printImage(image),
    PRINTLN: (payload: string) => printer.println(payload),
    SET_CHARACTER_SET: (payload: string) => printer.setCharacterSet(payload),
    BOLD: (payload: any) => printer.bold(payload),
    INVERT: (payload: any) => printer.invert(payload),
    UNDERLINE: (payload: any) => printer.underline(payload),
    UNDERLINE_THICK: (payload: any) => printer.underlineThick(payload),
    DRAW_LINE: (_payload: any) => printer.drawLine(),
    NEW_LINE: (_payload: any) => printer.newLine(),
    ALIGN_CENTER: (_payload: any) => printer.alignCenter(),
    ALIGN_LEFT: (_payload: any) => printer.alignLeft(),
    ALIGN_RIGHT: (_payload: any) => printer.alignRight(),
    SET_TYPE_FONT_A: (_payload: any) => printer.setTypeFontA(),
    SET_TYPE_FONT_B: (_payload: any) => printer.setTypeFontB(),
    SET_TEXT_NORMAL: (_payload: any) => printer.setTextNormal(),
    SET_TEXT_DOUBLE_HEIGHT: (_payload: any) => printer.setTextDoubleHeight(),
    SET_TEXT_DOUBLE_WIDTH: (_payload: any) => printer.setTextDoubleWidth(),
    SET_TEXT_QUAD_AREA: (_payload: any) => printer.setTextQuadArea(),
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

    this.printer.clear();

    await Promise.all(
      commands.map(async (command) => {
        try {
          await this.executeCommand(command);
        } catch (err) {
          throw new Error(`Error executing command: ${command.command} with error ${err}`);
        }
      })
    );

    await this.printer.execute();
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
