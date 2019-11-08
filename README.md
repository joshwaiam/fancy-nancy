# Printer-Bot

## About Printer-Bot

This tool will retrieve errors from the dashboard for a Canon iR-ADV C5255 printer and write them to a Slack channel.

In our office, our main printer is used to print a large quality of booklets, so errors will happen when paper runs out, toner needs to be changed, etc. Not catching these errors right away can lead to many unnecessary delays in print jobs completing. This tool notifies members of a Slack channel within 45 seconds if the printer goes into an error state.

## Using this repo

This code has some specific implementation related to our local setup. However, there are some broad strokes here regarding scraping a web page with dynamic content and sending it to a Slack channel that you can run with. I use environment variables for much of the customization, aside from the actual DOM nodes to target and parse.

### Getting started

1. Clone this repo.
2. Run `npm install` to add the necessary packages.
3. Create a `.env` file in the root, pasting the contents of `.env.txt` to use as the template.
4. Complete the `.env` file with your specific information.
5. Run `npm run dev` to start the bot in a development environment, or `npm run build` then `npm start` to run it in production.

### Install as a Windows service

1. Follow the above steps in Getting Started.
2. Run `npm run build`.
3. Run `npm run install-windows-service`. This requires adminstrator access to terminal (run VSCode as administrator).
4. You will have to go into Services and start it the first time, but it will now autostart when your computer does!

## Credits

A big thanks to my colleague Russell for recognizing this problem and the ability to automate a solution to fix it!
