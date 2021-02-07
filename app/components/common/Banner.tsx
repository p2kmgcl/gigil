import './Banner.scss';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';

export const Banner: FC<{
  title: ReactNode;
  subtitle?: ReactNode;
  alignment?: 'left' | 'center';
}> = ({ title, subtitle, alignment }) => (
  <header className={classNames('Banner', `Banner--${alignment || 'left'}`)}>
    <h1 className="Banner__title">{title}</h1>
    {subtitle ? <p className="Banner__subtitle">{subtitle}</p> : null}
  </header>
);
