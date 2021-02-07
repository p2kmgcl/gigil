import { collection, doc, DocumentReference } from '@firebase/firestore';
import { ExtendedConverter, getDB, Reference } from '../firebase';
import { Account, accountConverter } from './accountConverter';

export interface User {
  userId: string;
  accounts: Array<Reference<Account>>;
}

export const userConverter: ExtendedConverter<'userId', User> = {
  toFirestore({ accounts }: User) {
    return {
      accounts: accounts.map((account) => account.doc),
    };
  },

  fromFirestore(snapshot) {
    return {
      userId: snapshot.id,
      accounts: snapshot
        .get('accounts')
        .map(
          (doc: DocumentReference) =>
            new Reference(doc, accountConverter, { defaultToCache: true }),
        ),
    };
  },

  createCollection() {
    return collection(getDB(), 'users').withConverter(this);
  },

  createReference([userId]) {
    return new Reference(doc(getDB(), 'users', userId), this);
  },
};
