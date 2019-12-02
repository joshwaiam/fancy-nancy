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
const interval = parseInt(process.env.CHECK_INTERVAL, 10) * 1000;
// eslint-disable-next-line @typescript-eslint/camelcase
const messageParams = { link_names: true };

let previousMessage = "";
let browser: puppeteer.Browser;

const bot = new SlackBot({
  token,
  name
});

async function browserInit(): Promise<void> {
  try {
    browser = await puppeteer.launch({ args: ["--disable-gpu"] });
  } catch (e) {
    logger.error(e.message);
  }

  browser.on("disconnected", browserInit);
}

bot.on("start", async () => {
  await browserInit();
  setInterval(checkPrinterErrors, interval);
});

bot.on("close", () => {
  browser.close();
});

const checkPrinterErrors = async (): Promise<void> => {
  let page: puppeteer.Page;
  let errorsToReport: string[] = [];

  logger.info("Checking for errors.");

  /** Fetch the dashboard HTML */
  try {
    page = await browser.newPage();
    await page.goto(url);
  } catch (e) {
    logger.error(e.message);
    return;
  }

  /** Parse the error DOM nodes */
  try {
    errorsToReport = await page.evaluate(() => {
      const errorNodes = document.getElementsByClassName("ErrorInfoMessage");
      const parsedErrors: string[] = [];

      const errorsToIgnore = [
        "The cyan toner is low.",
        "The magenta toner is low.",
        "The yellow toner is low.",
        "The black toner is low.",
        "The waste toner container is almost full."
      ];

      for (const node of errorNodes) {
        const errorText = node.textContent.trim();
        if (!errorsToIgnore.includes(errorText)) {
          parsedErrors.push(errorText);
        }
      }

      return parsedErrors;
    });
  } catch (e) {
    logger.error(e.message);
    return;
  }

  /** Format the message to send back */
  let message: string;
  if (errorsToReport.length === 0) {
    message = ":success: Fancy Nancy is error free!";
  } else {
    message = ":warning: @channel\nFancy Nancy has the following errors:\n";
    errorsToReport.map(e => {
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
