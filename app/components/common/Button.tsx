import './Button.scss';
import classNames from 'classnames';
import { ButtonHTMLAttributes, FC } from 'react';

export const Button: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'link' | 'invisible' | 'danger';
  }
> = ({ className, variant, type, ...props }) => (
  <button
    {...props}
    type={type || 'button'}
    className={classNames(
      'Button',
      `Button--${variant || 'primary'}`,
      className,
    )}
  />
);
