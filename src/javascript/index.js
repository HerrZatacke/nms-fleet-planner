import '../scss/index.scss';
import Storage from './tools/storage';

const renderExpedition = ({ text, hidden, isPast, arrival, relativeTime, time, relative, id }, showDeleted) => {
  if (hidden && !showDeleted) {
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
<li data-id="${id}" class="${hidden ? 'deleted' : ''}" title="${relativeTime}">
  <button type="button" data-action="del">${showDeleted ? 'Purge' : 'Delete'}</button>
  <button type="button" data-action="edit">Edit</button>
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
  const hiddenIdInput = document.getElementById('id');
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
    hiddenIdInput.value = '';
    descriptionInput.value = '';
  };

  addButton.addEventListener('click', () => {
    let success;
    const hours = parseInt(hoursInput.value || 0, 10);
    const minutes = parseInt(minutesInput.value || 0, 10);
    const seconds = parseInt(secondsInput.value || 0, 10);
    const description = descriptionInput.value.trim();

    if (hiddenIdInput.value) {
      success = storage.updateExpedition(hours, minutes, seconds, description, hiddenIdInput.value);
    } else {
      success = storage.addExpedition(hours, minutes, seconds, description);
    }

    if (success) {
      clearValues();
    }
  });

  cancelButton.addEventListener('click', () => {
    clearValues();
  });

  showDeletedButton.addEventListener('click', () => {
    storage.setShowDeleted(true);
    showDeletedButton.parentElement.removeChild(showDeletedButton);
  });

  expeditionsList.addEventListener('click', ({ target }) => {

    const listNode = target.closest('li');
    const expeditionId = listNode.dataset.id;
    const expeditionData = storage.getExpedition(expeditionId);

    switch (target.dataset.action) {
      case 'del':
        console.log(expeditionId);
        storage.removeExpedition(expeditionId);
        clearValues();
        break;

      case 'edit':
        // eslint-disable-next-line no-case-declarations
        editForm.classList.add('edit-form--edit');
        hoursInput.value = expeditionData.inHours;
        minutesInput.value = expeditionData.inMinutes;
        secondsInput.value = expeditionData.inSeconds;
        hiddenIdInput.value = expeditionData.id;
        descriptionInput.value = expeditionData.text;
        break;

      default:
        console.log(JSON.stringify(expeditionData, null, 2));
    }

  });

  window.setInterval(() => {
    storage.render();
  }, 1000);

});
