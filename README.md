# ⒹⒹⒹ ➌ server

Local NodeJS server that acts as a web API for the Epson thermal printer series. The server is based on the https://github.com/Klemen1337/node-thermal-printer library.

The server exposes one endpoint to send a print command to: `POST http://{printer_ip}/printer`. An example of the request body is as follows:

```
{
  "commands": [
    {
      "command": "PRINTLN",
      "payload": "Print this line"
    }
  ]
}
```

The `PRINTLN` command maps to the `println` command of the `node-thermal-printer` package.

## Installation

1. Add a folder in the projects root, e.g. `images`.
2. Run `npm install`

## Usage

```
npm start
```
