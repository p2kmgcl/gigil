import { onSnapshot, query, QueryConstraint } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ExtendedConverter, Reference } from './firebase';
import { logger } from './logger';

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

    const reference = converter.createCollection(memoizedFieldPath);
    logger.time(`load_collection_${reference.path}`);

    return onSnapshot(query(reference, ...memoizedQueryConstraints), {
      next: async (querySnapshot) => {
        try {
          const convertedDocuments = querySnapshot.docs
            .map((snapshot) => snapshot.data() || null)
            .filter((data) => data) as T[];

          logger.time(`load_collection_references_${reference.path}`);
          for (const convertedDocument of convertedDocuments) {
            await loadReferences(convertedDocument);
          }
          logger.timeEnd(`load_collection_references_${reference.path}`);

          logger.timeEnd(`load_collection_${reference.path}`);

          setStatus({
            data: convertedDocuments,
            error: null,
            isValidating: false,
          });
        } catch (error: any) {
          logger.timeEnd(`load_collection_references_${reference.path}`, {
            error: error.toString(),
          });

          setStatus({
            data: [],
            error: error as Error,
            isValidating: false,
          });
        }
      },
      error: (error) => {
        logger.timeEnd(`load_collection_${reference.path}`, {
          error: error.toString(),
        });

        setStatus({
          data: [],
          error,
          isValidating: false,
        });
      },
    });
  }, [converter, memoizedFieldPath, memoizedQueryConstraints]);

  return status;
}
