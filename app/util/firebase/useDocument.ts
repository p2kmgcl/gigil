import { onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { ExtendedConverter, Reference } from './firebase';
import { logger } from './logger';

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

export function useDocument<K extends string, T>(
  converter: ExtendedConverter<K, T>,
  fieldPath: string[],
) {
  const [status, setStatus] = useState<{
    data: T | null;
    error: Error | null;
    isValidating: boolean;
  }>({ data: null, error: null, isValidating: true });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedFieldPath = useMemo(() => fieldPath, fieldPath);

  useEffect(() => {
    setStatus({
      data: null,
      error: null,
      isValidating: true,
    });

    const reference = converter.createReference(memoizedFieldPath);
    logger.time(`load_document_${reference.doc.path}`);

    return onSnapshot(reference.doc, {
      next: async (documentSnapshot) => {
        try {
          const convertedDocument = documentSnapshot.data();

          if (convertedDocument) {
            logger.time(`load_document_references_${reference.doc.path}`);
            await loadReferences(convertedDocument);
            logger.timeEnd(`load_document_references_${reference.doc.path}`);
          }

          logger.timeEnd(`load_document_${reference.doc.path}`);

          setStatus({
            data: convertedDocument as T | null,
            error: null,
            isValidating: false,
          });
        } catch (error: any) {
          logger.timeEnd(`load_document_references_${reference.doc.path}`, {
            error: error.toString(),
          });

          setStatus({
            data: null,
            error: error as Error,
            isValidating: false,
          });
        }
      },
      error: (error) => {
        logger.timeEnd(`load_document_${reference.doc.path}`, {
          error: error.toString(),
        });

        setStatus({
          data: null,
          error,
          isValidating: false,
        });
      },
    });
  }, [converter, memoizedFieldPath]);

  return status;
}
