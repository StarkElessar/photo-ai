const form = document.querySelector('.form-sending');
const messageErrorContainer = form.querySelector('.message-error');
const blockImage = form.querySelector('.block-image');
const imageInput = blockImage.querySelector('[name="photo_search"]');
const image = blockImage.querySelector('.block-image__image');
const classSelect = form.querySelector('select[name="class_name"]');
const colorSelect = form.querySelector('select[name="version_search"]');
const searchResultSection = document.querySelector('.search-result');
const searchResultContainer = document.querySelector('.search-result__container');
const resultImageContainer = searchResultSection.querySelector('.list-images');

const originUrl = 'http://185.204.3.62:8000/search/';

const resetImage = () => {
  image.removeAttribute('src');
  image.removeAttribute('alt');
  blockImage.style.backgroundImage = '';
  blockImage.classList.remove('selected');
};

const emptyLabel = () => `<p class="search-result__empty">К сожалению по Вашему запросу совпадений нет.. 😢</p>`;

const renderImages = (path, index) => `
  <div class="list-images__item">
    <img src="http://${path}" alt="Результат ${index + 1}">
  </div>
`;

const repeatedGet = async (url) => {
  try {
    const res = await fetch(url);
    const result = await res.json();

    if (result.status_search === 'in processing') {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const completedResult = await repeatedGet(url);
          resolve(completedResult);
        }, 2000);
      });
    }

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
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
  searchResultSection.classList.add('hidden');
  resultImageContainer.innerHTML = '';
  searchResultContainer.querySelector('.search-result__empty')?.remove();

  data.append('photo_search', imageInput.files[0]);
  data.append('class_name', classSelect.value);
  data.append('version_search', colorSelect.value);

  try {
    const res = await fetch(originUrl, { method: 'POST', body: data, });
    const result = await res.json();
    const { list_images, status_search } = await repeatedGet(result.detail_link);

    if (status_search === 'completed') {
      searchResultSection.classList.remove('hidden');

      if (list_images.length) {
        list_images.forEach((imageUrl, index) => {
          resultImageContainer.insertAdjacentHTML('beforeend', renderImages(imageUrl, index))
        })
      } else {
        resultImageContainer.classList.add('hidden');
        searchResultContainer.insertAdjacentHTML('beforeend', emptyLabel());
      }

      window.scrollTo({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        top: searchResultContainer.offsetTop - 150,
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    form.classList.remove('_sending');
    form.reset();
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