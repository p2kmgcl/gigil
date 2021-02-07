import classNames from 'classnames';
import React, { FC, ReactNode } from 'react';
import './Label.scss';

export const Label: FC<{
  label: ReactNode;
}> = ({ label, children }) => {
  const required = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.props.required,
  );

  return (
    <label className="Label">
      <span className="Label__content">
        {label}
        {required ? <sup>*</sup> : ''}
      </span>

      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            className: classNames('Label__input', child.props.className),
          });
        }

        return child;
      })}
    </label>
  );
};
