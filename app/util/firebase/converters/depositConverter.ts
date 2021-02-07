import { collection, doc, DocumentReference } from '@firebase/firestore';
import { ExtendedConverter, getDB, Reference } from '../firebase';
import { Movement, movementConverter } from './movementConverter';

export interface Deposit {
  depositId: string;
  name: string;
  budget: number;
  description: string;
  movements: Array<Reference<Movement>>;
}

export const depositConverter: ExtendedConverter<'depositId', Deposit> = {
  toFirestore({ name, budget, description, movements }) {
    return {
      name,
      budget,
      description,
      movements: movements.map((movement) => movement.doc),
    };
  },

  fromFirestore(snapshot) {
    return {
      depositId: snapshot.id,
      name: snapshot.get('name'),
      budget: snapshot.get('budget'),
      description: snapshot.get('description'),
      movements: snapshot
        .get('movements')
        .map((doc: DocumentReference) => new Reference(doc, movementConverter)),
    };
  },

  createCollection([accountId]) {
    return collection(getDB(), 'accounts', accountId, 'deposits').withConverter(
      this,
    );
  },

  createReference([accountId, depositId]) {
    return new Reference(
      doc(getDB(), 'accounts', accountId, 'deposits', depositId),
      this,
    );
  },
};
