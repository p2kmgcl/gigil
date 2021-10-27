import {
  createContext,
  FC,
  lazy,
  LazyExoticComponent,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { logger } from '../../util/firebase/logger';
import { DialogProps } from '../dialogs/DialogContext';

const Sections: Record<
  string,
  {
    Component: LazyExoticComponent<FC>;
    addButton?: {
      label: string;
      Component: LazyExoticComponent<FC<DialogProps>>;
    };
  }
> = {
  home: {
    Component: lazy(() => import('./home/Home')),
    addButton: {
      label: 'add-new-movement',
      Component: lazy(() => import('../dialogs/MovementDialog')),
    },
  },
  deposits: {
    Component: lazy(() => import('./deposits/Deposits')),
    addButton: {
      label: 'add-new-deposit',
      Component: lazy(() => import('../dialogs/DepositDialog')),
    },
  },
  categories: {
    Component: lazy(() => import('./categories/Categories')),
    addButton: {
      label: 'add-new-category',
      Component: lazy(() => import('../dialogs/CategoryDialog')),
    },
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

  useEffect(() => {
    logger.log(`enter_section_${sectionId}`);
  }, [sectionId]);

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
