import './LoadingMask.scss';
import { FC, ReactNode } from 'react';

export const LoadingMask: FC<{ loading: boolean; description: ReactNode }> = ({
  loading,
  description,
  children,
}) => {
  return (
    <div className="LoadingMask__wrapper">
      {loading ? (
        <>
          <progress className="sr-only">{description}</progress>
          <div className="LoadingMask__indicator" />
        </>
      ) : null}

      {children}
    </div>
  );
};
