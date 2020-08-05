import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

class Storage {

  constructor({ domNode, showDeleted }) {
    this.storageKey = 'fleet-expeditions';
    this.domNode = domNode;
    this.showDeleted = showDeleted || false;

    this.render();
  }

  setShowDeleted(showDeleted) {
    this.showDeleted = showDeleted;
    this.render();
  }

  getExpeditions() {
    const expeditionsList = localStorage.getItem(this.storageKey);
    if (!expeditionsList) {
      return [];
    }

    return JSON.parse(expeditionsList);
  }

  addExpedition(hours, minutes, seconds = 0, text) {
    if (isNaN(hours) || isNaN(minutes) || !text.trim()) {
      return;
    }

    const expeditions = this.getExpeditions();

    expeditions.push({
      done: dayjs()
        .add(hours, 'hours')
        .add(minutes, 'minutes')
        .add(seconds, 'seconds')
        .unix() || dayjs().unix(),
      text: text.trim(),
    });

    localStorage.setItem(this.storageKey, JSON.stringify(this.sortExpeditions(expeditions)));
    this.render();
  }

  removeExpedition(deleteDone) {
    const expeditions = this.getExpeditions()
      .map((expedition) => {
        const hide = expedition.done === parseInt(deleteDone, 10);

        if (this.showDeleted && hide) {
          return null;
        }

        return (
          {
            ...expedition,
            hide: hide ? true : expedition.hide,
          }
        );
      })
      .filter(Boolean);

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

  getExpedition(dataDone) {
    return this.getExpeditions()
      .find(({ done }) => done === parseInt(dataDone, 10)) || null;
  }

  getExpeditionData(rawData) {
    const date = dayjs.unix(rawData.done);

    const duration = date
      .subtract(dayjs().get('hours'), 'hours')
      .subtract(dayjs().get('minutes'), 'minutes')
      .subtract(dayjs().get('seconds'), 'seconds');

    return {
      ...rawData,
      date,
      duration,
      inHours: duration.format('HH'),
      inMinutes: duration.format('mm'),
      inSeconds: duration.format('ss'),
      isPast: !!date.isBefore(dayjs()),
      arrival: date.isBefore(dayjs()) ? 'arrived' : 'will be back',
      time: date.format('ddd, HH:mm'),
      relative: date.fromNow(),
    };
  }

  render() {
    // eslint-disable-next-line no-param-reassign
    this.domNode.innerHTML = this.getExpeditions()
      .map(this.getExpeditionData)
      .map((expedition) => (
        this.renderExpedition(expedition)
      ))
      .join('');
  }

  renderExpedition({ done, text, hide, isPast, arrival, time, relative }) {

    if (hide && !this.showDeleted) {
      return '';
    }

    const colorize = (color) => (txt) => (
      `<span style="color:${color};">${txt}</span>`
    );

    const relativeColor = isPast ? colorize('red') : colorize('green');
    const arrivalC = relativeColor(arrival);
    const timeC = relativeColor(time);
    const relativeC = relativeColor(relative);

    return `
<li class="${hide ? 'deleted' : ''}">
  <button type="button" data-del="${done}">${this.showDeleted ? 'Purge' : 'Delete'}</button>
  <button type="button" data-edit="${done}">Edit</button>
  at ${timeC} fleet "${text}" ${arrivalC}. (${relativeC})
</li>`;
  }
}

export default Storage;
