import './DepositList.scss';
import { CSSProperties, FC } from 'react';
import { getConfig } from '../../util/config';
import { getCurrency, getText } from '../../util/i18n/i18n';
import { useCollection } from '../../util/firebase/useCollection';
import { depositConverter } from '../../util/firebase/converters/depositConverter';
import { Button } from './Button';
import { DepositDialog } from '../dialogs/DepositDialog';
import { useOpenDialog } from '../dialogs/DialogContext';

function sum<T>(list: T[] | undefined, getValue: (v: T) => number): number {
  return list?.reduce((acc, v) => acc + getValue(v), 0) || 0;
}

export const DepositList: FC = () => {
  const { accountId } = getConfig();
  const { data: deposits } = useCollection(depositConverter, [accountId]);
  const openDialog = useOpenDialog();

  if (!deposits) {
    return null;
  }

  return (
    <div className="DepositList">
      {deposits.map((deposit) => {
        let expiredBudget = -sum(
          deposit.movements,
          (movement) => movement.get().amount,
        );

        if (Object.is(expiredBudget, -0)) {
          expiredBudget = 0;
        }

        const size = expiredBudget / deposit.budget;

        return (
          <article
            key={deposit.name}
            className="DepositList__deposit"
            style={{ '--size': size } as CSSProperties}
          >
            <h1 className="DepositList__deposit-name">{deposit.name}</h1>
            <p className="DepositList__deposit-budget">
              <span className="DepositList__deposit-expired-budget">
                {getCurrency(expiredBudget)}
              </span>
              <span className="DepositList__deposit-budget-separator">/</span>
              <span className="DepositList__deposit-total-budget">
                {getCurrency(deposit.budget)}
              </span>
            </p>

            <Button
              variant="invisible"
              aria-label={getText('edit')}
              onClick={() => openDialog(DepositDialog, { deposit })}
            />
          </article>
        );
      })}
    </div>
  );
};
