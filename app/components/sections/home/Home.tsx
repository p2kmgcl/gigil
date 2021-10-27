import { FC } from 'react';
import { AccountSummary } from './AccountSummary';
import { DepositList } from '../../common/DepositList';
import { MovementList } from './MovementList';

export const Home: FC = () => (
  <>
    <AccountSummary />
    <DepositList />
    <MovementList />
  </>
);

export default Home;
