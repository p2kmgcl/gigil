import './Categories.scss';
import { FC } from 'react';
import { getConfig } from '../../../util/config';
import { categoryConverter } from '../../../util/firebase/converters/categoryConverter';
import { useCollection } from '../../../util/firebase/useCollection';
import { getText } from '../../../util/i18n/i18n';
import { Banner } from '../../common/Banner';
import { Button } from '../../common/Button';
import { CategoryDialog } from '../../dialogs/CategoryDialog';
import { useOpenDialog } from '../../dialogs/DialogContext';

export const Categories: FC = () => {
  const { accountId } = getConfig();
  const { data: categories } = useCollection(categoryConverter, [accountId]);
  const openDialog = useOpenDialog();

  return (
    <>
      <Banner title={getText('categories')} />

      <div className="Categories">
        {categories.map((category) => (
          <article key={category.categoryId} className="Categories__category">
            <span>{category.name}</span>

            <Button
              variant="invisible"
              aria-label={getText('edit')}
              onClick={() => openDialog(CategoryDialog, { category })}
            />
          </article>
        ))}
      </div>
    </>
  );
};
