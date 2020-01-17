# ⒹⒹⒹ ➌ server

Local NodeJS server that does the following things:

- Watches a local folder and fires an event when a file is added
- Prints the image file to an Epson thermal printer
- Sends the file to Amazon S3
- `POST` to an API so the image can be used on a website

## Installation

1. Add a folder in the projects root, e.g. `images`.
2. Copy the `env.example`: `cp env.example .env`. Edit the values so it fits your AWS account and the folder you just created.
3. Run `npm install`

## Usage

```
npm start
```
