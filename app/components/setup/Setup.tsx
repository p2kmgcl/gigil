import { getMaybeCurrentUser, signIn } from '../../util/firebase/firebase';
import { Button } from '../common/Button';
import { getText } from '../../util/i18n/i18n';
import { AccountSelector } from './AccountSelector';
import { FC } from 'react';

export const Setup: FC = () => {
  const currentUser = getMaybeCurrentUser();

  const handleSignInClick = async () => {
    await signIn();
    window.location.reload();
  };

  return (
    <main>
      {currentUser ? (
        <>
          <div>
            {getText(
              'hello-$0',
              currentUser.displayName || getText('anonymous'),
            )}
          </div>
          <AccountSelector />
        </>
      ) : (
        <Button onClick={handleSignInClick}>{getText('sign-in')}</Button>
      )}
    </main>
  );
};

export default Setup;
