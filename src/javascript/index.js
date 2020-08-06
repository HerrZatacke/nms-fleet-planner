import '../scss/index.scss';
import Storage from './tools/storage';

const renderExpedition = ({ done, text, hide, isPast, arrival, relativeTime, time, relative }, showDeleted) => {
  if (hide && !showDeleted) {
    return '';
  }

  const colorize = (color) => (txt) => (
    `<span style="color:${color};">${txt}</span>`
  );

  const relativeColor = isPast ? colorize('red') : colorize('green');
  const arrivalC = relativeColor(arrival);
  const timeC = relativeColor(time);
  const relativeC = relativeColor(relative);

  return (`
<li class="${hide ? 'deleted' : ''}" title="${relativeTime}">
  <button type="button" data-del="${done}">${showDeleted ? 'Purge' : 'Delete'}</button>
  <button type="button" data-edit="${done}">Edit</button>
  at ${timeC} fleet "${text}" ${arrivalC}. (${relativeC})
</li>`);
};

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
    renderFn: (showDeleted) => (expeditions) => {
      expeditionsList.innerHTML = expeditions
        .map((expedition) => (
          renderExpedition(expedition, showDeleted)
        ))
        .join('');
    },
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
    }

  });

  window.setInterval(() => {
    storage.render();
  }, 1000);

});
