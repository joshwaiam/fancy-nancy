# Printer-Bot

## About Printer-Bot

This tool will retrieve errors from the dashboard for a Canon iR-ADV C5255 printer and write them to a Slack channel.

In our office, our main printer is used to print a large quality of booklets, so errors will happen when paper runs out, toner needs to be changed, etc. Not catching these errors right away can lead to many unnecessary delays in print jobs completing. This tool seeks to notify members of a Slack channel almost immediately if the printer goes into an error state.

## Using this repo

This code has some specific implementation related to our specific printer, the printer dashboard HTML structure, and our Slack setup. However, there are some broad strokes here regarding scraping a web page and sending it to a Slack channel that you can run with. The only real specific implementations come on which DOM nodes to select to fetch things like error text.

### Getting started

1. Clone this repo.
2. Run `npm install` to add the necessary packages.
3. Create a `.env` file in the root, pasting the contents of `.env.txt` to use as the template.
4. Complete the `.env` file with your specific Slack token, Slack channel name, and printer dashboard URL.

## Credits

A big thanks to my colleague Russell for recognizing this problem and the ability to automate a solution to fix it!
