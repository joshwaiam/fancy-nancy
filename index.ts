/* eslint-disable @typescript-eslint/no-use-before-define */
import * as SlackBot from "slackbots";
import * as dotenv from "dotenv";
import * as puppeteer from "puppeteer";
import logger from "./logger";

dotenv.config({ path: __dirname + "/.env" });

const token = process.env.SLACK_TOKEN;
const name = process.env.SLACK_BOT_NAME;
const url = process.env.PRINTER_URL;
const channel = process.env.SLACK_CHANNEL;
const admin = process.env.SLACK_ADMIN;
const interval = parseInt(process.env.CHECK_INTERVAL, 10) * 1000;
// eslint-disable-next-line @typescript-eslint/camelcase
const messageParams = { link_names: true };

let previousMessage = "";
let browser: puppeteer.Browser;

const bot = new SlackBot({
  token,
  name
});

bot.on("start", async () => {
  try {
    browser = await puppeteer.launch();
  } catch (e) {
    bot.postMessageToUser(admin, `I had trouble starting my web browser!`);
    logger.error(e.message);
    return;
  }

  setInterval(checkPrinterErrors, interval);
});

bot.on("close", () => {
  browser.close();
});

const checkPrinterErrors = async (): Promise<void> => {
  logger.info("Checking for errors.");

  let page: puppeteer.Page;
  let errors: string[] = [];

  /** Fetch the dashboard HTML */
  try {
    page = await browser.newPage();

    await page.goto(url);
  } catch (e) {
    bot.postMessageToUser(admin, "Error fetching the DOM.");
    logger.error(e.message);
    return;
  }

  /** Parse the error DOM nodes */
  try {
    errors = await page.evaluate(() => {
      const nodes = document.getElementsByClassName("ErrorInfoMessage");
      const errorMessages: string[] = [];

      for (const node of nodes) {
        errorMessages.push(node.textContent);
      }

      return errorMessages;
    });
  } catch (e) {
    bot.postMessageToChannel(
      channel,
      `${admin} FIX ME!  I had trouble parsing the DOM nodes!`,
      messageParams
    );
    logger.error(e.message);
    return;
  }

  /** Format the message to send back */
  let message: string;
  if (errors.length === 0) {
    message = ":success: Fancy Nancy is error free!";
  } else {
    message = ":warning: @channel\nFancy Nancy has the following errors:\n";
    errors.map(e => {
      message += `*${e}*\n`;
    });
  }

  logger.info("Error check complete.");

  /** Exit if the error message is the same as the last check */
  if (message === previousMessage) {
    return;
  }

  previousMessage = message;
  bot.postMessageToChannel(channel, message, messageParams);
};
