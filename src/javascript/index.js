import '../scss/index.scss';
import Storage from './tools/storage';

document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add');
  const expeditionsList = document.getElementById('expeditions');

  const storage = new Storage({
    domNode: expeditionsList,
  });

  addButton.addEventListener('click', () => {
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const descriptionInput = document.getElementById('description');

    storage.addExpedition(
      parseInt(hoursInput.value, 10),
      parseInt(minutesInput.value, 10),
      descriptionInput.value.trim(),
    );
  });

  expeditionsList.addEventListener('click', ({ target }) => {
    const { done } = target.dataset;
    if (done !== undefined) {
      storage.removeExpedition(done);
    }
  });

  window.setInterval(() => {
    storage.render();
  }, 1000);

});
