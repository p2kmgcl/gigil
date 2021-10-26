let languageId: string;
let language: Record<string, string> = {};
let defaultCurrency: string;

/* eslint-disable */
const LANGUAGES = {
  // @ts-ignore
  'es-ES': () => import('url:./es-ES.json'),
};
/* eslint-enable */

const RELATIVE_TIME_STEPS = [
  { unit: 'minute', value: 60 },
  { unit: 'hour', value: 60 },
  { unit: 'day', value: 24 },
  { unit: 'week', value: 7 },
  { unit: 'month', value: 4 },
  { unit: 'year', value: 12 },
];

export async function loadLanguage(key: keyof typeof LANGUAGES) {
  try {
    language = await LANGUAGES[key]();
    languageId = key;
  } catch (error) {
    throw new Error(`Cannot load language "${key}"`);
  }
}

export function setDefaultCurrency(currency: string) {
  defaultCurrency = currency;
}

export function getText(key: string, ...values: Array<string | number>) {
  if (!language[key] && process.env.NODE_ENV === 'development') {
    console.warn(`There is no translation for "${key}" to "${languageId}"`);
  }

  return (language[key] || `[[${key}]]`).replace(
    /\$([0-9]+)/g,
    (_match, indexString) =>
      values[indexString]?.toString() || `$${indexString}`,
  );
}

export function getDate(date: Date) {
  return date.toLocaleDateString(languageId, { dateStyle: 'long' });
}

export function getRelativeDate(date: Date) {
  let unit = 'second';
  let value = (date.getTime() - Date.now()) / 1000;

  for (const timeStep of RELATIVE_TIME_STEPS) {
    if (Math.abs(value) >= timeStep.value) {
      unit = timeStep.unit;
      value = value / timeStep.value;
    } else {
      break;
    }
  }

  return new Intl.RelativeTimeFormat(languageId, { style: 'long' }).format(
    Math.round(value),
    unit as any,
  );
}

export function getCurrency(
  amount: number,
  currency: string = defaultCurrency,
) {
  return amount.toLocaleString(languageId, {
    style: 'currency',
    currency,
  });
}

export function getCurrencyStep(currency: string = defaultCurrency) {
  switch (currency) {
    case 'EUR':
      return 0.01;
    default:
      return 0;
  }
}
