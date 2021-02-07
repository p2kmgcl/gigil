import 'url:./robots.txt';
import './index.scss';
import { render } from 'react-dom';
import { App } from './components/App';
import { Setup } from './components/setup/Setup';
import { getMaybeConfig } from './util/config';
import {
  getMaybeCurrentUser,
  init as initFirebase,
} from './util/firebase/firebase';
import { getText, loadLanguage, setDefaultCurrency } from './util/i18n/i18n';
import { DialogContextProvider } from './components/dialogs/DialogContext';
import { SectionContextProvider } from './components/sections/SectionContext';

(async function () {
  await loadLanguage(document.documentElement.lang as any);
  await setDefaultCurrency(getMaybeConfig()?.accountCurrency || '');
  await initFirebase();
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

  navigator.serviceWorker.register(
    new URL('./service-worker.ts', import.meta.url),
    {
      type: 'module',
    },
  );
})();
