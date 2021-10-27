import { FC, FormEvent } from 'react';
import { DialogProps } from './DialogContext';
import { Button } from '../common/Button';
import { Banner } from '../common/Banner';
import { getText } from '../../util/i18n/i18n';
import { Fieldset } from '../common/Fieldset';
import { Form } from '../common/Form';
import { Label } from '../common/Label';
import {
  Category,
  categoryConverter,
} from '../../util/firebase/converters/categoryConverter';
import { uuidv4 } from '../../util/uuidv4';
import { runTransaction } from '@firebase/firestore';
import { getDB } from '../../util/firebase/firebase';
import { getConfig } from '../../util/config';

export const CategoryDialog: FC<DialogProps & { category?: Category }> = ({
  category,
  close,
}) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.target as HTMLFormElement);

    const updatedCategory: Category = {
      categoryId: category?.categoryId || uuidv4(),
      name: formData.get('name') as string,
    };

    await runTransaction(getDB(), async (transaction) => {
      transaction.set(
        categoryConverter.createReference([
          getConfig().accountId,
          updatedCategory.categoryId,
        ]).doc,
        updatedCategory,
      );
    });

    close(updatedCategory.categoryId);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Banner title={getText('category')} />

      <Fieldset>
        <Label label={getText('name')}>
          <input
            type="text"
            defaultValue={category?.name}
            name="name"
            required
          />
        </Label>
      </Fieldset>

      <Fieldset direction="row">
        <Button variant="secondary" onClick={() => close('')}>
          {getText('cancel')}
        </Button>

        <Button type="submit">{getText('save')}</Button>
      </Fieldset>
    </Form>
  );
};

export default CategoryDialog;
