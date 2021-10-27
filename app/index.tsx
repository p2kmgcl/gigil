import { render } from 'react-dom';
import { getMaybeConfig } from './util/config';
import {
  getMaybeCurrentUser,
  init as initFirebase,
  initDatabase as initFirebaseDatabase,
} from './util/firebase/firebase';
import { loadLanguage, setDefaultCurrency } from './util/i18n/i18n';
import { DialogContextProvider } from './components/dialogs/DialogContext';
import { SectionContextProvider } from './components/sections/SectionContext';
import { logger } from './util/firebase/logger';
import manifest from './manifest.json';
import { lazy, Suspense } from 'react';
import { App } from './components/App';

(async function () {
  logger.time('init');
  document.documentElement.title = manifest.name;
  document.documentElement.lang = manifest.lang;
  initFirebase();
  logger.timeEnd('init');

  logger.time('load_language');
  await loadLanguage(document.documentElement.lang as any);
  setDefaultCurrency(getMaybeConfig()?.accountCurrency || '');
  logger.timeEnd('load_language');

  logger.time('initialize_database');
  await initFirebaseDatabase();
  logger.timeEnd('initialize_database');

  const app = document.getElementById('app');
  const ready = Boolean(getMaybeCurrentUser() && getMaybeConfig());

  const MainComponent = ready
    ? App
    : lazy(() => import('./components/setup/Setup'));

  render(
    <DialogContextProvider>
      <SectionContextProvider defaultSectionId="home">
        <Suspense fallback="">
          <MainComponent />
        </Suspense>
      </SectionContextProvider>
    </DialogContextProvider>,
    app,
  );

  navigator.serviceWorker?.register(
    new URL('./service-worker.ts', import.meta.url),
    { type: 'module' },
  );
})();
