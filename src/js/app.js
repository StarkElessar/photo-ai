const form = document.querySelector('.form-sending');
const messageErrorContainer = form.querySelector('.message-error');
const blockImage = form.querySelector('.block-image');
const imageInput = blockImage.querySelector('[name="photo_search"]');
const image = blockImage.querySelector('.block-image__image');
const classSelect = form.querySelector('select[name="class_name"]');
const colorSelect = form.querySelector('select[name="version_search"]');

const resetImage = () => {
  image.removeAttribute('src');
  image.removeAttribute('alt');
  blockImage.style.backgroundImage = '';
  blockImage.classList.remove('selected');
};

const handleFormSending = async (event) => {
  const messageErrorText = 'Фотография, класс и цвет должны быть выбраны!';
  const data = new FormData();
  event.preventDefault();

  if (!imageInput.value || !classSelect.value || !colorSelect.value) {
    form.classList.add('_error');
    messageErrorContainer.textContent = messageErrorText;
    return;
  }

  form.classList.remove('_error');
  form.classList.add('_sending');

  data.append('photo_search', imageInput.files[0]);
  data.append('class_name', classSelect.value);
  data.append('version_search', colorSelect.value);

  try {
    const res = await fetch('http://185.204.3.62:8000/search/', {
      method: 'POST',
      mode: 'no-cors',
      body: data,
    });

    console.log(res);
  } catch (error) {
    console.log(error);
  } finally {
    form.classList.remove('_sending');
    form.reset();
    resetImage();
  }
};

const handleSelectImage = ({ target }) => {
  const file = target.files[0];
  const reader = new FileReader();

  if (!file) {
    return;
  }

  reader.readAsDataURL(file);

  reader.onload = (event) => {
    image.setAttribute('src', event.target.result);
    image.setAttribute('alt', file.name.split('.')[0]);
    blockImage.classList.add('selected');
    blockImage.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
  };
};

form.addEventListener('submit', handleFormSending);
imageInput.addEventListener('change', handleSelectImage);
