import { collection, doc, Timestamp } from '@firebase/firestore';
import { ExtendedConverter, getDB, Reference } from '../firebase';
import { Category, categoryConverter } from './categoryConverter';
import { Deposit, depositConverter } from './depositConverter';

export interface Movement {
  movementId: string;
  amount: number;
  category: Reference<Category>;
  deposit: Reference<Deposit> | null;
  date: Date;
  description: string;
}

export const movementConverter: ExtendedConverter<'movementId', Movement> = {
  toFirestore({ amount, category, date, deposit, description }) {
    return {
      amount,
      date: Timestamp.fromDate(date),
      description,
      category: category.doc,
      deposit: deposit?.doc || null,
    };
  },

  fromFirestore(snapshot) {
    const depositId = snapshot.get('deposit');

    return {
      movementId: snapshot.id,
      amount: snapshot.get('amount'),
      date: (snapshot.get('date') as Timestamp).toDate(),
      description: snapshot.get('description'),
      category: new Reference(snapshot.get('category'), categoryConverter, {
        defaultToCache: true,
      }),
      deposit: depositId
        ? new Reference(depositId, depositConverter, {
            defaultToCache: true,
          })
        : null,
    };
  },

  createCollection([accountId]) {
    return collection(
      getDB(),
      'accounts',
      accountId,
      'movements',
    ).withConverter(this);
  },

  createReference([accountId, movementId]) {
    return new Reference(
      doc(getDB(), 'accounts', accountId, 'movements', movementId),
      this,
    );
  },
};
