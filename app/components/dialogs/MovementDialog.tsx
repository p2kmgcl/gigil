import { FC, FormEvent, useState } from 'react';
import { getConfig } from '../../util/config';
import { categoryConverter } from '../../util/firebase/converters/categoryConverter';
import {
  Movement,
  movementConverter,
} from '../../util/firebase/converters/movementConverter';
import { getDB } from '../../util/firebase/firebase';
import { useCollection } from '../../util/firebase/useCollection';
import { getCurrencyStep, getText } from '../../util/i18n/i18n';
import { Button } from '../common/Button';
import { DialogProps } from './DialogContext';
import { getISODateString } from '../../util/getISODateString';
import { DocumentSnapshot, runTransaction } from '@firebase/firestore';
import { accountConverter } from '../../util/firebase/converters/accountConverter';
import { uuidv4 } from '../../util/uuidv4';
import { Banner } from '../common/Banner';
import { Label } from '../common/Label';
import { Fieldset } from '../common/Fieldset';
import { Form } from '../common/Form';
import { depositConverter } from '../../util/firebase/converters/depositConverter';

export const MovementDialog: FC<DialogProps & { movement?: Movement }> = ({
  close,
  movement,
}) => {
  const { accountId } = getConfig();
  const [categoryId, setCategoryId] = useState(movement?.category.doc.id || '');
  const [depositId, setDepositId] = useState(movement?.deposit?.doc.id || '');
  const { data: categories } = useCollection(categoryConverter, [accountId]);
  const { data: deposits } = useCollection(depositConverter, [accountId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.target as HTMLFormElement);
    const nextDepositId = (formData.get('deposit') as string) || null;
    const prevDepositId = movement?.deposit?.doc.id || null;

    const updatedMovement: Movement = {
      movementId: movement?.movementId || uuidv4(),
      amount: Number(formData.get('amount') as string),
      description: formData.get('description') as string,
      date: new Date(formData.get('date') as string),
      category: categoryConverter.createReference([
        accountId,
        formData.get('category') as string,
      ]),
      deposit: nextDepositId
        ? depositConverter.createReference([accountId, nextDepositId])
        : null,
    };

    await runTransaction(getDB(), async (transaction) => {
      const movementDocument = movementConverter.createReference([
        accountId,
        updatedMovement.movementId,
      ]).doc;

      const accountDocument = accountConverter.createReference([accountId]).doc;
      const nextDepositDocument = updatedMovement.deposit?.doc || null;

      const prevDepositDocument = prevDepositId
        ? depositConverter.createReference([accountId, prevDepositId]).doc
        : null;

      const accountSnapshot = await transaction.get(accountDocument);
      const movementSnapshot = await transaction.get(movementDocument);

      const nextDepositSnapshot = nextDepositDocument
        ? await transaction.get(nextDepositDocument)
        : null;

      const prevDepositSnapshot = prevDepositDocument
        ? await transaction.get(prevDepositDocument)
        : null;

      if (!accountSnapshot.exists()) {
        throw new Error('Invalid account');
      }

      if (prevDepositDocument?.id !== nextDepositDocument?.id) {
        if (prevDepositDocument && prevDepositSnapshot) {
          if (!prevDepositSnapshot?.exists()) {
            throw new Error('Invalid deposit');
          }

          transaction.update(prevDepositDocument, {
            movements: prevDepositSnapshot
              .get('movements')
              .filter(
                (movementDocument: DocumentSnapshot) =>
                  movementDocument.id !== updatedMovement.movementId,
              ),
          });
        }

        if (nextDepositDocument && nextDepositSnapshot) {
          if (!nextDepositSnapshot?.exists()) {
            throw new Error('Invalid deposit');
          }

          transaction.update(nextDepositDocument, {
            movements: [
              ...nextDepositSnapshot.get('movements'),
              movementDocument,
            ],
          });
        }
      }

      const previousMovementAmount =
        (movementSnapshot.exists() ? movementSnapshot.get('amount') : 0) || 0;

      transaction.update(accountDocument, {
        amount:
          accountSnapshot.get('amount') +
          updatedMovement.amount -
          previousMovementAmount,
      });

      transaction.set(movementDocument, updatedMovement);
    });

    close(updatedMovement.movementId);
  };

  const handleDeleteButtonClick = async () => {
    if (!movement) {
      throw new Error('No movement');
    }

    if (!confirm(getText('are-you-sure'))) {
      return;
    }

    const prevDepositId = movement.deposit?.doc.id || null;
    const movementDocument = movementConverter.createReference([
      accountId,
      movement.movementId,
    ]).doc;

    await runTransaction(getDB(), async (transaction) => {
      const accountDocument = accountConverter.createReference([accountId]).doc;
      const prevDepositDocument = prevDepositId
        ? depositConverter.createReference([accountId, prevDepositId]).doc
        : null;

      const accountSnapshot = await transaction.get(accountDocument);
      const prevDepositSnapshot = prevDepositDocument
        ? await transaction.get(prevDepositDocument)
        : null;

      if (!accountSnapshot.exists()) {
        throw new Error('Invalid account');
      }

      if (prevDepositDocument && prevDepositSnapshot) {
        if (!prevDepositSnapshot?.exists()) {
          throw new Error('Invalid deposit');
        }

        transaction.update(prevDepositDocument, {
          movements: prevDepositSnapshot
            .get('movements')
            .filter(
              (movementDocument: DocumentSnapshot) =>
                movementDocument.id !== movement.movementId,
            ),
        });
      }

      transaction.update(accountDocument, {
        amount: accountSnapshot.get('amount') - movement.amount,
      });

      transaction.delete(movementDocument);
    });

    close('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Banner title={getText('movement')} />

      <Fieldset>
        <Label label={getText('amount')}>
          <input
            autoFocus
            defaultValue={movement?.amount}
            placeholder={getCurrencyStep().toString()}
            name="amount"
            type="number"
            step={getCurrencyStep()}
            required
          />
        </Label>

        <Label label={getText('date')}>
          <input
            name="date"
            type="datetime-local"
            defaultValue={getISODateString(movement?.date || new Date())}
            required
          />
        </Label>

        <Label label={getText('category')}>
          <select
            name="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            required
          >
            <option disabled value="">
              -
            </option>

            {categories?.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>
        </Label>

        <Label label={getText('deposit')}>
          <select
            name="deposit"
            value={depositId}
            onChange={(event) => setDepositId(event.target.value)}
          >
            <option value="">-</option>

            {deposits?.map((deposit) => (
              <option key={deposit.depositId} value={deposit.depositId}>
                {deposit.name}
              </option>
            ))}
          </select>
        </Label>

        <Label label={getText('description')}>
          <textarea name="description" defaultValue={movement?.description} />
        </Label>
      </Fieldset>

      <Fieldset direction="row">
        <Button onClick={() => close('')} variant="secondary">
          {getText('cancel')}
        </Button>

        {movement ? (
          <Button onClick={handleDeleteButtonClick} variant="danger">
            {getText('delete')}
          </Button>
        ) : null}

        <Button type="submit">{getText('save')}</Button>
      </Fieldset>
    </Form>
  );
};

export default MovementDialog;
