import { runTransaction } from '@firebase/firestore';
import { FC, FormEvent } from 'react';
import { getConfig } from '../../util/config';
import {
  Deposit,
  depositConverter,
} from '../../util/firebase/converters/depositConverter';
import { getDB } from '../../util/firebase/firebase';
import { getCurrencyStep, getText } from '../../util/i18n/i18n';
import { uuidv4 } from '../../util/uuidv4';
import { Banner } from '../common/Banner';
import { Button } from '../common/Button';
import { Fieldset } from '../common/Fieldset';
import { Form } from '../common/Form';
import { Label } from '../common/Label';
import { DialogProps } from './DialogContext';

export const DepositDialog: FC<DialogProps & { deposit?: Deposit }> = ({
  close,
  deposit,
}) => {
  const { accountId } = getConfig();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.target as HTMLFormElement);

    const updatedDeposit: Deposit = {
      depositId: deposit?.depositId || uuidv4(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      budget: Number(formData.get('budget')),
      movements: deposit?.movements || [],
    };

    await runTransaction(getDB(), async (transaction) => {
      transaction.set(
        depositConverter.createReference([accountId, updatedDeposit.depositId])
          .doc,
        updatedDeposit,
      );
    });

    close(updatedDeposit.depositId);
  };

  const handleDeleteButtonClick = async () => {
    if (!deposit) {
      throw new Error('Invalid deposit');
    }

    if (!confirm(getText('are-you-sure'))) {
      return;
    }

    await runTransaction(getDB(), async (transaction) => {
      const depositDocument = depositConverter.createReference([
        accountId,
        deposit.depositId,
      ]).doc;

      const depositSnapshot = await transaction.get(depositDocument);

      if (!depositSnapshot.exists()) {
        throw new Error('Invalid deposit');
      }

      for (const movementDocument of depositSnapshot.get('movements')) {
        transaction.update(movementDocument, {
          deposit: null,
        });
      }

      transaction.delete(depositDocument);
    });

    close('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Banner title={getText('deposit')} />

      <Fieldset>
        <Label label={getText('name')}>
          <input
            type="text"
            defaultValue={deposit?.name}
            name="name"
            required
          />
        </Label>

        <Label label={getText('budget')}>
          <input
            autoFocus
            defaultValue={deposit?.budget}
            placeholder={getCurrencyStep().toString()}
            name="budget"
            type="number"
            step={getCurrencyStep()}
            required
          />
        </Label>

        <Label label={getText('description')}>
          <textarea name="description" defaultValue={deposit?.description} />
        </Label>
      </Fieldset>

      <Fieldset direction="row">
        <Button variant="secondary" onClick={() => close('')}>
          {getText('cancel')}
        </Button>

        {deposit ? (
          <Button onClick={handleDeleteButtonClick} variant="danger">
            {getText('delete')}
          </Button>
        ) : null}

        <Button type="submit">{getText('save')}</Button>
      </Fieldset>
    </Form>
  );
};
