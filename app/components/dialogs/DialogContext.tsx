import './DialogContext.scss';
import {
  createContext,
  FC,
  Ref,
  useCallback,
  useContext,
  useState,
} from 'react';

export interface DialogProps {
  close: (closeValue: any) => void;
}

interface DialogRecord<T> {
  Component: FC<DialogProps & T>;
  baseProps: DialogProps;
  extraProps: T;
  dialogRef: Ref<HTMLDivElement>;
  zIndex: number;
}

interface DialogContextDefinition {
  dialogs: Record<string, DialogRecord<any>>;

  open: <T extends Record<string, any>>(
    Component: FC<DialogProps & T>,
    extraProps: T,
  ) => Promise<any>;
}

const MODAL_BASE_ZINDEX = 1000;
let nextDialogId = 0;

const DialogContext = createContext<DialogContextDefinition>({
  dialogs: {},
  open: () => Promise.resolve(),
});

export const DialogContextProvider: FC = ({ children }) => {
  const [dialogs, setDialogs] = useState<DialogContextDefinition['dialogs']>(
    {},
  );

  const open: DialogContextDefinition['open'] = useCallback(
    (Component, extraProps) =>
      new Promise((resolve) => {
        setDialogs((prevDialogs) => {
          const dialogId = nextDialogId++;
          const nextDialogs = { ...prevDialogs };
          let dialogElement: HTMLDivElement | null = null;

          const dialogRef: DialogRecord<any>['dialogRef'] = (
            nextDialogElement,
          ) => {
            dialogElement = nextDialogElement;
            dialogElement?.focus();
          };

          const removeDialog = () =>
            setDialogs((prevDialogs) => {
              const nextDialogs = { ...prevDialogs };
              delete nextDialogs[dialogId];

              if (Object.keys(nextDialogs).length === 0) {
                nextDialogId = 0;
              }

              return nextDialogs;
            });

          const handleClose = (closeValue: any) => {
            if (dialogElement) {
              dialogElement.addEventListener('animationend', removeDialog);
              dialogElement.classList.add('DialogContext__dialog--hidden');
            } else {
              removeDialog();
            }

            resolve(closeValue);
          };

          nextDialogs[dialogId] = {
            Component,
            baseProps: { close: handleClose },
            extraProps,
            dialogRef,
            zIndex: nextDialogId,
          };

          return nextDialogs;
        });
      }),
    [],
  );

  return (
    <DialogContext.Provider value={{ dialogs, open }}>
      {Object.entries(dialogs).map(
        ([
          dialogId,
          { Component, baseProps, extraProps, dialogRef, zIndex },
        ]) => (
          <div
            role="dialog"
            key={dialogId}
            ref={dialogRef}
            className="DialogContext__dialog"
            style={{ zIndex: zIndex + MODAL_BASE_ZINDEX }}
            tabIndex={-1}
          >
            <Component {...baseProps} {...extraProps} />
          </div>
        ),
      )}

      {children}
    </DialogContext.Provider>
  );
};

export const useOpenDialog = () => {
  return useContext(DialogContext).open;
};
