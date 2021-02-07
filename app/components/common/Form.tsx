import './Form.scss';
import classNames from 'classnames';
import React, {
  FC,
  FormEvent,
  FormEventHandler,
  FormHTMLAttributes,
  useState,
} from 'react';
import { getText } from '../../util/i18n/i18n';
import { LoadingMask } from './LoadingMask';

export const Form: FC<
  Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
    onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<any> | any;
  }
> = ({ onSubmit, className, children, ...props }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await onSubmit(event);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <LoadingMask description={getText('saving')} loading={loading}>
      <form
        {...props}
        className={classNames('Form', className)}
        onSubmit={handleSubmit}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              disabled: loading,
            });
          }

          return child;
        })}
      </form>
    </LoadingMask>
  );
};
