import { collection, doc } from '@firebase/firestore';
import { ExtendedConverter, getDB, Reference } from '../firebase';

export interface Account {
  accountId: string;
  name: string;
  currency: string;
  amount: number;
}

export const accountConverter: ExtendedConverter<'accountId', Account> = {
  toFirestore({ name, currency, amount }: Account) {
    return { name, currency, amount };
  },

  fromFirestore(snapshot) {
    return {
      accountId: snapshot.id,
      name: snapshot.get('name'),
      currency: snapshot.get('currency'),
      amount: snapshot.get('amount'),
    };
  },

  createReference([accountId]) {
    return new Reference(doc(getDB(), 'accounts', accountId), this);
  },

  createCollection() {
    return collection(getDB(), 'accounts').withConverter(this);
  },
};
