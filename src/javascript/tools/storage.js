import dayjs from 'dayjs';
import relTime from 'dayjs/plugin/relativeTime';
import FleetNotificationWorker from '../worker';

dayjs.extend(relTime);

class Storage {

  constructor({ showDeleted, renderFn }) {
    this.storageKey = 'fleet-expeditions';
    this.showDeleted = showDeleted || false;
    this.renderFn = renderFn;
    this.workerPort = null;
    this.initNotifications();
    this.render();
  }

  initNotifications() {
    Notification.requestPermission((permission) => {
      if (permission === 'granted') {
        const fleetWorker = new FleetNotificationWorker();
        this.workerPort = fleetWorker.port;

        this.getExpeditions()
          .forEach((fleet) => this.setUpNotification(fleet));

        window.fw = fleetWorker;
      }
    });
  }

  setUpNotification(expedition) {
    const { id, inMillis, text, hidden, isPast } = this.getExpeditionData(expedition);

    if (isPast || hidden) {
      this.workerPort.postMessage({
        id,
      });
      return;
    }

    this.workerPort.postMessage({
      id,
      time: inMillis,
      message: `Fleet "${text}" has arrived!`,
    });
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

  static validHMST(hours, minutes, seconds, text) {
    return (
      !(isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds) ||
      !text.trim() ||
      (!hours && !minutes && !seconds))
    );
  }

  static createExpeditionData(hours, minutes, seconds, text, identifier = null) {
    const id = identifier || dayjs().valueOf().toString(10);
    return {
      id,
      done: dayjs()
        .add(hours, 'hours')
        .add(minutes, 'minutes')
        .add(seconds, 'seconds')
        .unix() || dayjs().unix(),
      text: text.trim(),
    };
  }

  addExpedition(hours, minutes, seconds, text) {
    if (!Storage.validHMST(hours, minutes, seconds, text)) {
      return false;
    }

    const expeditions = this.getExpeditions();
    const newExpedition = Storage.createExpeditionData(hours, minutes, seconds, text);

    expeditions.push(newExpedition);

    this.setUpNotification(newExpedition);

    localStorage.setItem(this.storageKey, JSON.stringify(this.sortExpeditions(expeditions)));
    this.render();
    return true;
  }

  updateExpedition(hours, minutes, seconds, text, id) {
    if (!Storage.validHMST(hours, minutes, seconds, text)) {
      return false;
    }

    const updatedExpedition = Storage.createExpeditionData(hours, minutes, seconds, text, id);
    const expeditions = this.getExpeditions()
      .map((expedition) => (
        expedition.id === id ? updatedExpedition : expedition
      ));

    this.setUpNotification(updatedExpedition);

    localStorage.setItem(this.storageKey, JSON.stringify(this.sortExpeditions(expeditions)));
    this.render();
    return true;
  }

  removeExpedition(deleteId) {
    const expeditions = this.getExpeditions()
      .map((expedition) => {
        if (expedition.id !== deleteId) {
          return expedition;
        }

        console.log(expedition);
        this.setUpNotification({
          ...expedition,
          hidden: true,
        });

        if (this.showDeleted) {
          return null;
        }

        return {
          ...expedition,
          hidden: true,
        };
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

  getExpedition(expediitionId) {
    const rawExpeditionData = this.getExpeditions()
      .find(({ id }) => id === expediitionId) || null;

    if (rawExpeditionData) {
      return this.getExpeditionData(rawExpeditionData);
    }

    return null;
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
      inMillis: duration * 1000,
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
