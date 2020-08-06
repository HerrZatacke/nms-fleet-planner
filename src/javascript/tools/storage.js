import dayjs from 'dayjs';
import relTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relTime);

class Storage {

  constructor({ showDeleted, renderFn }) {
    this.storageKey = 'fleet-expeditions';
    this.showDeleted = showDeleted || false;
    this.renderFn = renderFn;

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
      relativeTime: duration.format('HH:mm:ss'),
      isPast: !!date.isBefore(dayjs()),
      arrival: date.isBefore(dayjs()) ? 'arrived' : 'will be back',
      time: date.format('ddd, HH:mm'),
      relative: date.fromNow(),
    };
  }

  render() {
    const renderFn = this.renderFn(this.showDeleted);
    const expeditionData = this.getExpeditions().map(this.getExpeditionData);
    renderFn(expeditionData);
  }
}

export default Storage;
