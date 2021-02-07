import './MovementList.scss';
import { FC } from 'react';
import { getConfig } from '../../../util/config';
import { getCurrency, getRelativeDate, getText } from '../../../util/i18n/i18n';
import { useCollection } from '../../../util/firebase/useCollection';
import { movementConverter } from '../../../util/firebase/converters/movementConverter';
import { useOpenDialog } from '../../dialogs/DialogContext';
import { MovementDialog } from '../../dialogs/MovementDialog';
import { limit, orderBy } from '@firebase/firestore';
import { Button } from '../../common/Button';

export const MovementList: FC = () => {
  const { accountId } = getConfig();
  const openDialog = useOpenDialog();

  const { data: movements } = useCollection(
    movementConverter,
    [accountId],
    [orderBy('date', 'desc'), limit(10)],
  );

  if (!movements) {
    return null;
  }

  return (
    <>
      {movements.map((movement) => (
        <article className="MovementList__movement" key={movement.movementId}>
          <time
            className="MovementList__movement-date"
            dateTime={movement.date.toISOString()}
          >
            {getRelativeDate(movement.date)}
          </time>
          <span className="MovementList__movement-category">
            {movement.category.get().name}
          </span>
          <span className="MovementList__movement-currency">
            {getCurrency(movement.amount)}
          </span>

          <Button
            variant="invisible"
            aria-label={getText('edit')}
            onClick={() => openDialog(MovementDialog, { movement })}
          />
        </article>
      ))}
    </>
  );
};
