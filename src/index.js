const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime')

dayjs.extend(relativeTime);

const inFilePath = path.join(process.cwd(), 'in.txt');
const inFile = fs.readFileSync(inFilePath, { encoding: 'utf8' });

const dates = inFile.split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((rawLine) => {

    try {
      return JSON.parse(rawLine);
    } catch (err) {
      // not json encoded
    }

    const lineRegEx = /^(in|at) ([0-9]{2}):([0-9]{2})(.*)$/gi
    matches = lineRegEx.exec(rawLine);

    if (matches) {
      const [, inat, hours, minutes, text] = matches;
      switch(inat) {
        case 'in':
          return { done: dayjs().add(hours, 'hours').add(minutes, 'minutes').unix(), text: text.trim() };
        case 'at':
          return { done: dayjs().set('hours', hours).set('minutes', minutes).unix(), text: text.trim() };
        default:
          return false;
      }
    }
    return false;
  })
  .filter(Boolean);

const result = dates.sort((a, b) => {
  if (a.done > b.done) return 1;
  if (a.done < b.done) return -1;
  return 0;
});

result.forEach(({ done, text }) => {
  if (done > dayjs().subtract(12, 'hours').unix()) {
    const date = dayjs.unix(done);
    const relativeColor = date.isBefore(dayjs()) ? chalk.red : chalk.green;
    const arrival = date.isBefore(dayjs()) ? 'arrived' : 'will be back';
    const time = relativeColor(date.format('ddd, HH:mm'));
    const txt = relativeColor(text);
    const relative = relativeColor(date.fromNow());

    console.log(`at ${time} fleet "${txt}" ${arrival}. (${relative})`);
  }
});

const toBeSaved = dates
  .map((data) => JSON.stringify(data))
  .join('\n')

fs.writeFileSync(inFilePath, toBeSaved, { encoding: 'utf8' });
