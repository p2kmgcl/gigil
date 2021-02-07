import {
  createContext,
  FC,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import { CategoryDialog } from '../dialogs/CategoryDialog';
import { DepositDialog } from '../dialogs/DepositDialog';
import { DialogProps } from '../dialogs/DialogContext';
import { MovementDialog } from '../dialogs/MovementDialog';
import { Categories } from './categories/Categories';
import { Deposits } from './deposits/Deposits';
import { Home } from './home/Home';

const Sections: Record<
  string,
  { Component: FC; addButton?: { label: string; Component: FC<DialogProps> } }
> = {
  home: {
    Component: Home,
    addButton: { label: 'add-new-movement', Component: MovementDialog },
  },
  deposits: {
    Component: Deposits,
    addButton: { label: 'add-new-deposit', Component: DepositDialog },
  },
  categories: {
    Component: Categories,
    addButton: { label: 'add-new-category', Component: CategoryDialog },
  },
};

const SectionContext = createContext<{
  sectionId: keyof typeof Sections;
  setSectionId: (sectionId: keyof typeof Sections) => void;
}>({
  sectionId: 'home',
  setSectionId: () => {},
});

export function SectionContextProvider({
  defaultSectionId,
  children,
}: {
  defaultSectionId: keyof typeof Sections;
  children: ReactNode;
}): ReactElement {
  const [sectionId, setSectionId] =
    useState<keyof typeof Sections>(defaultSectionId);

  return (
    <SectionContext.Provider value={{ sectionId, setSectionId }}>
      {children}
    </SectionContext.Provider>
  );
}

export function useSections() {
  const context = useContext(SectionContext);
  return [Sections, context.sectionId, context.setSectionId] as const;
}
