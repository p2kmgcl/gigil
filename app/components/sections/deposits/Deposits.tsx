import { FC } from 'react';
import { getText } from '../../../util/i18n/i18n';
import { Banner } from '../../common/Banner';
import { DepositList } from '../../common/DepositList';

export const Deposits: FC = () => {
  return (
    <>
      <Banner title={getText('deposits')} />
      <DepositList />
    </>
  );
};

export default Deposits;
