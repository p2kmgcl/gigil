import { collection, doc } from '@firebase/firestore';
import { ExtendedConverter, getDB, Reference } from '../firebase';

export interface Category {
  categoryId: string;
  name: string;
}

export const categoryConverter: ExtendedConverter<'categoryId', Category> = {
  toFirestore({ name }: Category) {
    return { name };
  },

  fromFirestore(snapshot) {
    return {
      categoryId: snapshot.id,
      name: snapshot.get('name'),
    };
  },

  createCollection([accountId]) {
    return collection(
      getDB(),
      'accounts',
      accountId,
      'categories',
    ).withConverter(this);
  },

  createReference([accountId, categoryId]) {
    return new Reference(
      doc(getDB(), 'accounts', accountId, 'categories', categoryId),
      this,
    );
  },
};
