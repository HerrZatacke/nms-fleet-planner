/* eslint-disable no-restricted-globals */

// collection for all timeouts of the worker
const timeouts = {};

// eslint-disable-next-line no-undef
onconnect = (event) => {
  const port = event.ports[0];

  port.onmessage = ({ data }) => {
    const { id, time, message } = data;
    if (!id) {
      console.log('unknown message', data);
      return;
    }

    const expeditionId = `ex_${id}`;

    self.clearTimeout(timeouts[expeditionId]);
    delete timeouts[expeditionId];

    if (time && message) {
      timeouts[expeditionId] = self.setTimeout(() => {
        delete timeouts[expeditionId];
        console.log(message);
        const notification = new Notification(message, {});

        notification.addEventListener('click', () => {
          console.log('clicked');
        });
      }, time);
    }

    console.log(timeouts);
  };
};
