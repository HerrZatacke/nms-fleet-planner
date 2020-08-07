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
    const now = dayjs();

    const duration = Math.abs(date.subtract(now).unix());

    const inHours = String(Math.floor(duration / 3600)).padStart(2, '0');
    const inMinutes = String(Math.floor(duration / 60) % 60).padStart(2, '0');
    const inSeconds = String(duration % 60).padStart(2, '0');

    return {
      ...rawData,
      date,
      inHours,
      inMinutes,
      inSeconds,
      relativeTime: `${inHours}:${inMinutes}:${inSeconds}`,
      isPast: !!date.isBefore(now),
      arrival: date.isBefore(now) ? 'arrived' : 'will be back',
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
