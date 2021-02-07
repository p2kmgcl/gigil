import { onSnapshot, query, QueryConstraint } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ExtendedConverter, Reference } from './firebase';

const DEFAULT_QUERY_CONSTRAINTS: QueryConstraint[] = [];

async function loadReferences<T>(o: T): Promise<T> {
  if (o instanceof Reference) {
    await o.load();
  } else if (Array.isArray(o)) {
    await Promise.all(o.map(loadReferences));
  } else if (o !== null && typeof o === 'object') {
    await Promise.all(Object.values(o).map(loadReferences));
  }

  return o;
}

export function useCollection<K extends string, T>(
  converter: ExtendedConverter<K, T>,
  fieldPath: string[],
  queryConstraints = DEFAULT_QUERY_CONSTRAINTS,
  queryConstraintsDependencies: any[] = [],
) {
  const [status, setStatus] = useState<{
    data: T[];
    error: Error | null;
    isValidating: boolean;
  }>({ data: [], error: null, isValidating: true });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedFieldPath = useMemo(() => fieldPath, fieldPath);

  const memoizedQueryConstraints = useMemo(
    () => queryConstraints,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    queryConstraintsDependencies,
  );

  useEffect(() => {
    setStatus({
      data: [],
      error: null,
      isValidating: true,
    });

    return onSnapshot(
      query(
        converter.createCollection(memoizedFieldPath),
        ...memoizedQueryConstraints,
      ),
      {
        next: async (querySnapshot) => {
          try {
            const convertedDocuments = querySnapshot.docs
              .map((snapshot) => snapshot.data() || null)
              .filter((data) => data) as T[];

            for (const convertedDocument of convertedDocuments) {
              await loadReferences(convertedDocument);
            }

            setStatus({
              data: convertedDocuments,
              error: null,
              isValidating: false,
            });
          } catch (error) {
            setStatus({
              data: [],
              error: error as Error,
              isValidating: false,
            });
          }
        },
        error: (error) => {
          setStatus({
            data: [],
            error,
            isValidating: false,
          });
        },
      },
    );
  }, [converter, memoizedFieldPath, memoizedQueryConstraints]);

  return status;
}
