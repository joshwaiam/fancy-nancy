import * as SlackBot from 'slackbots';
import * as dotenv from 'dotenv';
import * as puppeteer from 'puppeteer';
import logger from './logger';

dotenv.config();

const bot = new SlackBot({
  token: process.env.SLACK_TOKEN,
  name: 'printerbot'
});

let browser: puppeteer.Browser;
let page: puppeteer.Page;

bot.on("start", async () => {


  try {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  
    await page.goto(process.env.PRINTER_URL);
  } catch(e) {
    logger.error(e.message);
    return;
  }

  const errorText = await page.evaluate(() => {
    const el = document.getElementById("deviceErrorInfoModule").getElementsByTagName('p')[0];
    if(!el) {
      return;
    }
    return el.textContent;
  });

  bot.postMessageToChannel(process.env.SLACK_CHANNEL, `PrinterBot is now online.\n\nCurrent error status:\n *${errorText}*`) 

  browser.close();
});