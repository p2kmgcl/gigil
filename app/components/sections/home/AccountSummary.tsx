import { FC, useMemo } from 'react';
import { getConfig } from '../../../util/config';
import { getCurrency, getText } from '../../../util/i18n/i18n';
import { useCollection } from '../../../util/firebase/useCollection';
import { useDocument } from '../../../util/firebase/useDocument';
import { accountConverter } from '../../../util/firebase/converters/accountConverter';
import { depositConverter } from '../../../util/firebase/converters/depositConverter';
import { Banner } from '../../common/Banner';

function sum<T>(list: T[] | undefined, getValue: (v: T) => number): number {
  return list?.reduce((acc, v) => acc + getValue(v), 0) || 0;
}

export const AccountSummary: FC = () => {
  const config = getConfig();
  const { data: account } = useDocument(accountConverter, [config.accountId]);
  const { data: deposits } = useCollection(depositConverter, [
    config.accountId,
  ]);

  const total = account?.amount || 0;

  const depositsAmount = useMemo(
    () =>
      sum(deposits, (deposit) => {
        const expiredBudget = sum(
          deposit.movements,
          (movement) => movement.get().amount,
        );

        return Math.max(0, deposit.budget + expiredBudget);
      }),
    [deposits],
  );

  return (
    <Banner
      title={getCurrency(total - depositsAmount)}
      subtitle={getText('$0-without-deposits', getCurrency(total))}
      alignment="center"
    />
  );
};
