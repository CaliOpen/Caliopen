import React from 'react';
import classnames from 'classnames';
import TextItem from './components/TextItem';
import './style.scss';

interface Props extends React.ComponentProps<'ul'> {
  className?: string;
}
function TextList({ className, ...props }: Props): JSX.Element {
  return <ul className={classnames('m-text-list', className)} {...props} />;
}

export { TextItem };

export default TextList;
