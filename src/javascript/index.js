import '../scss/index.scss';
import Storage from './tools/storage';

document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add');
  const cancelButton = document.getElementById('cancel');
  const showDeletedButton = document.getElementById('showDeleted');
  const expeditionsList = document.getElementById('expeditions');
  const editForm = document.querySelector('.edit-form');
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const hiddenDoneInput = document.getElementById('done');
  const descriptionInput = document.getElementById('description');

  const storage = new Storage({
    domNode: expeditionsList,
    showDeleted: false,
  });

  const clearValues = () => {
    editForm.classList.remove('edit-form--edit');
    hoursInput.value = '';
    minutesInput.value = '';
    secondsInput.value = '';
    hiddenDoneInput.value = '';
    descriptionInput.value = '';
  };

  addButton.addEventListener('click', () => {
    if (hiddenDoneInput.value) {
      storage.removeExpedition(hiddenDoneInput.value);
    }

    storage.addExpedition(
      parseInt(hoursInput.value, 10),
      parseInt(minutesInput.value, 10),
      parseInt(secondsInput.value, 10),
      descriptionInput.value.trim(),
    );
    clearValues();
  });

  cancelButton.addEventListener('click', () => {
    clearValues();
  });

  showDeletedButton.addEventListener('click', () => {
    storage.setShowDeleted(true);
    showDeletedButton.parentElement.removeChild(showDeletedButton);
  });

  expeditionsList.addEventListener('click', ({ target }) => {
    const { del, edit } = target.dataset;

    console.log({ del, edit });

    if (del !== undefined) {
      storage.removeExpedition(del);
      clearValues();
    }

    if (edit !== undefined) {
      const expeditionData = storage.getExpeditionData(storage.getExpedition(edit));
      editForm.classList.add('edit-form--edit');
      hoursInput.value = expeditionData.inHours;
      minutesInput.value = expeditionData.inMinutes;
      secondsInput.value = expeditionData.inSeconds;
      hiddenDoneInput.value = expeditionData.done;
      descriptionInput.value = expeditionData.text;
      // storage.removeExpedition(edit);
      // storage.addExpedition(
      //   parseInt(hoursInput.value, 10),
      //   parseInt(minutesInput.value, 10),
      //   parseInt(secondsInput.value, 10),
      //   descriptionInput.value.trim(),
      // );
      // clearValues();
    }

  });

  window.setInterval(() => {
    storage.render();
  }, 1000);

});
