import * as React from 'react';
import { useTags } from '../../hooks/useTags';

/**
 * @deprecated use `useTags` instead
 */
const withTags = () => (WrappedComponent) => {
  function WithTags(props) {
    const { tags } = useTags();
    return <WrappedComponent tags={tags} {...props} />;
  }

  return WithTags;
};

export default withTags;
