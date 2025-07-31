/**
 * Функция для создания объекта из массива мета-тегов с ключами property (за вычетом "og:") и значениями content
 * @param opengrapArr массив мета-тегов
 * @returns {opengrap}
 */
function getOpengraphDescription(opengrapArr) {
  const opengraph = {};
  for (element of opengrapArr) {
    opengraph[element.getAttribute('property').split(':')[1]] = element.getAttribute('content');
  };
  return opengraph;
}

/**
 * Функция для создания объекта с массивами бирок, категорий и скидок
 * @param tagsArr массив HTML элементов (<span>)
 * @returns {tags}
 */
function getTags(tagsArr) {
  const tags = {};
  for (element of tagsArr) {
    if (element.className === 'red') { // Для скидки
      if (!tags['discount']) {
        tags['discount'] = []; // Если массив не существует, то создаем его
      }
      tags['discount'].push(element.textContent);
    }

    if (element.className === 'green') { // Для категории
      if (!tags['category']) {
        tags['category'] = []; // Если массив не существует, то создаем его
      }
      tags['category'].push(element.textContent);
    }

    if (element.className === 'blue') { // Для бирки
      if (!tags['label']) {
        tags['label'] = []; // Если массив не существует, то создаем его
      }
      tags['label'].push(element.textContent);
    }
  }
  return tags;
}

/**
 * Функция для подсчета скидки в стоимостном выражении
 * @param price цена товара
 * @param oldPrice старая цена товара
 * @returns {discount}
 */
function getDiscount(price, oldPrice) {
  if (oldPrice) {
    return oldPrice - price;
  } else {
    return 0;
  }
}

/**
 * Функция для подсчета скидки в процентном выражении
 * @param price цена товара
 * @param oldPrice старая цена товара
 * @returns {discount}
 */
function getDiscountPercent(price, oldPrice) {
  if (oldPrice) {
    return `${((oldPrice - price) / oldPrice * 100).toFixed(2)}%`;
  } else {
    return 0;
  }
}

/**
 * Функция для создания объекта со свойствами товара
 * @param propertiesArr массив HTML элементов (<li> c двумя <span>)
 * @returns {properties}
 */
function getProperties(propertiesArr) {
  const properties = {}
  for (element of propertiesArr) {
    properties[element.firstElementChild.textContent] = element.lastElementChild.textContent
  }
  return properties;
}

/**
 * Функция для создания массива фотографий
 * @param imagesArr массив HTML элементов (<img>)
 * @param previewImageSrc ссылка на изображение по умолчанию
 * @returns {images}
 */
function getImages(imagesArr, previewImageSrc) {
  // Сортируем массив так, чтобы на первой позиции было изображение, которое выбрано по умолчанию
  imagesArr.sort((a, b) => {
    if (a.dataset.src === previewImageSrc) {
      return -1;
    } else {
      return 1;
    }
  });

  // Добавляем объекты в массив images
  const images = [];
  imagesArr.forEach(element => {
    images.push({
      preview: element.src,
      full: element.dataset.src,
      alt: element.alt
    })
  });

  return images;
}

// Функция-парсер
function parsePage() {
  // Получение мета-информации страницы
  const meta = {
    title: document.querySelector('title').textContent.split('—')[0].trim(),
    description: document.querySelector('[name=description]').content,
    keywords: document.querySelector('[name=keywords]').content.split(','),
    opengraph: getOpengraphDescription(document.querySelectorAll('meta[property]')),
    language: document.querySelector('html').lang
  }

  // Выносим константы для подсчета скидки в product
  const price = +document.querySelector('.price').firstChild.textContent.trim().slice(1); // Получаем цену (firstChild), удаляем формат валюты
  const oldPrice = +document.querySelector('.price').firstElementChild.textContent.trim().slice(1); // Получаем цену (firstElementChild), удаляем формат валюты
  // Данные карточки товара
  const product = {
    id: document.querySelector('.product').dataset.id,
    name: document.querySelector('h1').textContent,
    isLiked: document.querySelector('button.like').hasAttribute('active'),
    tags: getTags(document.querySelector('.tags').children),
    price,
    oldPrice,
    discount: getDiscount(price, oldPrice),
    discountPercent: getDiscountPercent(price, oldPrice),
    currency: document.querySelector('.price').firstChild.textContent.trim().slice(0, 1),
    properties: getProperties(document.querySelector('.properties').children),
    description: document.querySelector('.description').innerHTML.trim(),
    images: getImages(Array.from(document.querySelectorAll('.preview nav button img')), document.querySelector('.preview figure img').src)
  }
  console.log(product)

    return {
        meta,
        product,
        suggested: [],
        reviews: []
    };
}

window.parsePage = parsePage;
