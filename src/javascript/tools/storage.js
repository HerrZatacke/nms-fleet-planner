import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

class Storage {

  constructor({ domNode }) {
    this.storageKey = 'fleet-expeditions';
    this.domNode = domNode;

    this.render();
  }

  getExpeditions() {
    const expeditionsList = localStorage.getItem(this.storageKey);
    if (!expeditionsList) {
      return [];
    }

    return JSON.parse(expeditionsList);
  }

  addExpedition(hours, minutes, text) {
    if (isNaN(hours) || isNaN(minutes) || !text.trim()) {
      return;
    }

    const expeditions = this.getExpeditions();

    expeditions.push({
      done: dayjs().add(hours, 'hours').add(minutes, 'minutes').unix() || dayjs().unix(),
      text: text.trim(),
    });

    localStorage.setItem(this.storageKey, JSON.stringify(this.sortExpeditions(expeditions)));
    this.render();
  }

  removeExpedition(deleteDone) {
    const expeditions = this.getExpeditions()
      .map((expedition) => (
        {
          ...expedition,
          hide: expedition.done === parseInt(deleteDone, 10) ? true : expedition.hide,
        }
      ));

    console.log(expeditions);

    localStorage.setItem(this.storageKey, JSON.stringify(this.sortExpeditions(expeditions)));
    this.render();
  }

  sortExpeditions(expeditions) {
    return expeditions
      .sort((a, b) => {
        if (a.done > b.done) {
          return 1;
        }

        if (a.done < b.done) {
          return -1;
        }

        return 0;
      });
  }

  render() {
    // eslint-disable-next-line no-param-reassign
    this.domNode.innerHTML = this.getExpeditions()
      .map((expedition) => (
        Storage.renderExpedition(expedition)
      ))
      .join('');
  }

  static renderExpedition({ done, text, hide }) {

    if (hide) {
      return '';
    }

    const colorize = (color) => (txt) => (
      `<span style="color:${color};">${txt}</span>`
    );

    const date = dayjs.unix(done);
    const relativeColor = date.isBefore(dayjs()) ? colorize('red') : colorize('green');
    const arrival = relativeColor(date.isBefore(dayjs()) ? 'arrived' : 'will be back');
    const time = relativeColor(date.format('ddd, HH:mm'));
    const relative = relativeColor(date.fromNow());

    return `<li><button type="button" data-done="${done}">X</button> at ${time} fleet "${text}" ${arrival}. (${relative})</li>`;
  }
}

export default Storage;
