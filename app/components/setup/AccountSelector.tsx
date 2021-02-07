import { ChangeEvent, FC } from 'react';
import { setConfig } from '../../util/config';
import { userConverter } from '../../util/firebase/converters/userConverter';
import { getMaybeCurrentUser } from '../../util/firebase/firebase';
import { useDocument } from '../../util/firebase/useDocument';
import { getText } from '../../util/i18n/i18n';

export const AccountSelector: FC = () => {
  const { uid } = getMaybeCurrentUser() || { uid: '' };
  const { data: user } = useDocument(userConverter, [uid]);

  const handleAccountFormChange = (event: ChangeEvent<HTMLFormElement>) => {
    const accountId = new FormData(event.currentTarget).get('account');

    if (!accountId) {
      return;
    }

    const account = user?.accounts
      .map((account) => account.get())
      .find((userAccount) => userAccount.accountId === accountId);

    if (!account) {
      return;
    }

    setConfig({
      accountId: account.accountId,
      accountName: account.name,
      accountCurrency: account.currency,
    });

    window.location.reload();
  };

  return (
    <form onChange={handleAccountFormChange}>
      <label>
        {getText('account')}:{' '}
        <select defaultValue="" name="account">
          <option disabled value="">
            -
          </option>

          {user?.accounts.map((userAccount) => {
            const { accountId, name } = userAccount.get();

            return (
              <option key={accountId} value={accountId}>
                {name}
              </option>
            );
          })}
        </select>
      </label>
    </form>
  );
};
