import 'url:./robots.txt';
import './index.scss';
import { render } from 'react-dom';
import { App } from './components/App';
import { Setup } from './components/setup/Setup';
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

(async function () {
  initFirebase();
  logger.log('init');

  logger.time('load_language');
  await loadLanguage(document.documentElement.lang as any);
  setDefaultCurrency(getMaybeConfig()?.accountCurrency || '');
  logger.timeEnd('load_language');

  logger.time('initialize_database');
  await initFirebaseDatabase();
  logger.timeEnd('initialize_database');

  const app = document.getElementById('app');
  const ready = Boolean(getMaybeCurrentUser() && getMaybeConfig());
  const MainComponent = ready ? App : Setup;

  render(
    <DialogContextProvider>
      <SectionContextProvider defaultSectionId="home">
        <MainComponent />
      </SectionContextProvider>
    </DialogContextProvider>,
    app,
  );

  navigator.serviceWorker?.register(
    new URL('./service-worker.ts', import.meta.url),
    {
      type: 'module',
    },
  );
})();
