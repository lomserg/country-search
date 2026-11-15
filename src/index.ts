import { debounce } from './utils/debounce.js';
import { searchCountries } from './api/searchCountries.js';
import { mapCountryResponse } from './api/mapCountryResponse.js';
import type { Country } from './types/Country.js';

// Настройки приложения
const DEBOUNCE_DELAY = 400;
const REQUEST_TIMEOUT = 10000;

// Создание основных элементов
const app = document.createElement('main');
app.className = 'app';

const header = document.createElement('header');
header.className = 'header';

const title = document.createElement('h1');
title.textContent = 'Country Search';

const subtitle = document.createElement('p');
subtitle.textContent = 'Найди информацию о любой стране мира';

header.append(title, subtitle);

const form = document.createElement('form');
form.className = 'search-form';

const input = document.createElement('input');
input.className = 'search-input';
input.type = 'search';
input.placeholder = 'Например, Canada';
input.setAttribute('aria-label', 'Название страны');
input.autocomplete = 'off';

const searchButton = document.createElement('button');
searchButton.className = 'search-button';
searchButton.type = 'submit';
searchButton.textContent = 'Найти';

form.append(input, searchButton);

const status = document.createElement('div');
status.className = 'status';
status.setAttribute('role', 'status');
status.setAttribute('aria-live', 'polite');

const results = document.createElement('section');
results.className = 'results';
results.setAttribute('aria-label', 'Результаты поиска');

const retryButton = document.createElement('button');
retryButton.className = 'retry-button';
retryButton.type = 'button';
retryButton.textContent = 'Повторить запрос';
retryButton.hidden = true;

app.append(header, form, status, retryButton, results);
document.body.append(app);

// Состояние приложения
let activeController: AbortController | null = null;
let lastQuery = '';
let currentCountries: Country[] = [];
// Изменение сообщения
function setStatus(message: string, isError = false): void {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

// Отображение одной страны
function createCountryCard(country: Country): HTMLElement {
  const card = document.createElement('article');
  card.className = 'country-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Подробнее о стране ${country.name}`);

  const flag = document.createElement('div');
  flag.className = 'country-flag';
  flag.textContent = country.flag;

  const name = document.createElement('h2');
  name.textContent = country.name;

  const capital = document.createElement('p');
  capital.className = 'country-info';
  capital.textContent = `Столица: ${country.capital}`;

  const region = document.createElement('p');
  region.className = 'country-info';
  region.textContent = `Регион: ${country.region}`;

  card.append(flag, name, capital, region);

  card.addEventListener('click', () => {
    renderCountryDetails(country);
  });
  // Отображение подробной информации о стране

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      renderCountryDetails(country);
    }
  });

  return card;
}

function renderCountryDetails(country: Country): void {
  results.replaceChildren();

  const backButton = document.createElement('button');
  backButton.className = 'details-button';
  backButton.type = 'button';
  backButton.textContent = '← Назад к результатам';

  backButton.addEventListener('click', () => {
    renderCountries(currentCountries);
  });

  const details = document.createElement('article');
  details.className = 'country-card country-detail';

  const flag = document.createElement('div');
  flag.className = 'country-flag';
  flag.textContent = country.flag;

  const name = document.createElement('h2');
  name.textContent = country.name;

  const capital = document.createElement('p');
  capital.className = 'country-info';
  capital.textContent = `Столица: ${country.capital}`;

  const region = document.createElement('p');
  region.className = 'country-info';
  region.textContent = `Регион: ${country.region}`;

  const population = document.createElement('p');
  population.className = 'country-info';
  population.textContent = `Население: ${country.population.toLocaleString('ru-RU')}`;

  const languages = document.createElement('p');
  languages.className = 'country-info';
  languages.textContent = `Языки: ${country.languages.join(', ')}`;

  details.append(flag, name, capital, region, population, languages);
  results.append(backButton, details);
}
// Отображение списка стран
function renderCountries(countries: Country[]): void {
  currentCountries = countries;
  results.replaceChildren();

  for (const country of countries) {
    results.append(createCountryCard(country));
  }
}

// Выполнение поиска
async function performSearch(query: string): Promise<void> {
  if (!query) {
    results.replaceChildren();
    setStatus('');
    retryButton.hidden = true;
    searchButton.disabled = false;
    return;
  }

  const controller = new AbortController();
  activeController = controller;

  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT);
  const combinedSignal = AbortSignal.any([controller.signal, timeoutSignal]);

  searchButton.disabled = true;
  retryButton.hidden = true;
  setStatus('Загрузка...');
  results.replaceChildren();

  try {
    const rawCountries = await searchCountries(query, combinedSignal);

    // Защита от отображения результата устаревшего запроса
    if (controller.signal.aborted) {
      return;
    }

    const countries = rawCountries.map(mapCountryResponse);

    renderCountries(countries);

    if (countries.length === 0) {
      setStatus('Страны не найдены.');
    } else {
      setStatus(`Найдено стран: ${countries.length}`);
    }
  } catch (error) {
    // Пользователь ввёл новый запрос — старую ошибку не показываем
    if (controller.signal.aborted) {
      return;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      setStatus('Превышено время ожидания ответа. Попробуйте ещё раз.', true);
    } else {
      setStatus('Не удалось выполнить поиск. Проверьте соединение.', true);
    }

    retryButton.hidden = false;
  } finally {
    if (activeController === controller) {
      searchButton.disabled = false;
      activeController = null;
    }
  }
}

// Debounce для поиска
const debouncedSearch = debounce((query: string) => {
  void performSearch(query);
}, DEBOUNCE_DELAY);

// Немедленная отмена предыдущего запроса при изменении поля
input.addEventListener('input', () => {
  activeController?.abort();

  const query = input.value.trim();
  lastQuery = query;

  retryButton.hidden = true;

  if (!query) {
    debouncedSearch('');
    return;
  }

  setStatus('Ожидание ввода...');
  debouncedSearch(query);
});

// Поиск по нажатию Enter или кнопки
form.addEventListener('submit', (event) => {
  event.preventDefault();

  activeController?.abort();

  const query = input.value.trim();
  lastQuery = query;

  void performSearch(query);
});

// Повтор последнего запроса
retryButton.addEventListener('click', () => {
  if (lastQuery) {
    void performSearch(lastQuery);
  }
});
