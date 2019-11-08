/* eslint-disable @typescript-eslint/no-use-before-define */
import * as SlackBot from "slackbots";
import * as dotenv from "dotenv";
import * as puppeteer from "puppeteer";
import logger from "./logger";

dotenv.config();

const token = process.env.SLACK_TOKEN;
const name = process.env.SLACK_BOT_NAME;
const url = process.env.PRINTER_URL;
const channel = process.env.SLACK_CHANNEL;
const interval = parseInt(process.env.CHECK_INTERVAL, 10) * 1000;

let previousMessage = "";
let browser: puppeteer.Browser;

const bot = new SlackBot({
  token,
  name
});

/**
 * TODO: Ensure errors properly parsing
 */

bot.on("start", async () => {
  try {
    browser = await puppeteer.launch();
  } catch (e) {
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
  /** Fetch the dashboard HTML */
  try {
    page = await browser.newPage();

    await page.goto(url);
  } catch (e) {
    logger.error(e.message);
    return;
  }

  /** Parse the error DOM nodes */
  let errors: string[] = [];
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
    logger.error(e.message);
  }

  /** Format the message to send back */
  let message: string;
  if (errors.length === 0) {
    message = ":success: Fancy Nancy is error free!";
  } else {
    message = ":warning: Fancy Nancy has the following errors:\n";
    errors.map(e => {
      message += `*${e}*\n`;
    });
  }

  /** Exit if the error message is the same as the last check */
  if (message === previousMessage) {
    logger.info("Skipping message due to no change in status.");
    return;
  }

  previousMessage = message;

  bot.postMessageToChannel(channel, message);
  logger.info("Error check complete.");
};
