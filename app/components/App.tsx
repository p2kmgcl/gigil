import './App.scss';
import { Plus } from 'react-feather';
import { Button } from './common/Button';
import { useOpenDialog } from './dialogs/DialogContext';
import { getText } from '../util/i18n/i18n';
import { useSections } from './sections/SectionContext';
import { Suspense } from 'react';

export const App = () => {
  const openDialog = useOpenDialog();
  const [sections, sectionId, setSectionId] = useSections();
  const { Component, addButton } = sections[sectionId];

  return (
    <main className="App__main">
      <div className="App__content">
        <Suspense fallback="">
          <Component />
        </Suspense>
      </div>

      <header className="App__header">
        <select
          className="App__select"
          value={sectionId}
          onChange={(event) => setSectionId(event.target.value)}
        >
          {Object.keys(sections).map((sectionId) => (
            <option key={sectionId} value={sectionId}>
              {getText(sectionId)}
            </option>
          ))}
        </select>

        {addButton ? (
          <Button
            className="App__add-button"
            onClick={() => openDialog(addButton.Component, {})}
          >
            <span className="sr-only">{getText(addButton.label)}</span>
            <Plus />
          </Button>
        ) : null}
      </header>
    </main>
  );
};
