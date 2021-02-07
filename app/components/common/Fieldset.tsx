import './Fieldset.scss';
import classNames from 'classnames';
import { FC, FieldsetHTMLAttributes } from 'react';

export const Fieldset: FC<
  FieldsetHTMLAttributes<HTMLFieldSetElement> & { direction?: 'column' | 'row' }
> = ({ className, direction, ...props }) => (
  <fieldset
    {...props}
    className={classNames(
      'Fieldset',
      `Fieldset--${direction || 'column'}`,
      className,
    )}
  />
);
