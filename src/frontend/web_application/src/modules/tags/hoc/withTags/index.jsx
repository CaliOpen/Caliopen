import React, { PureComponent } from 'react';
import WithTagsBase from '../../components/WithTags';

/**
 * @deprecated use `useTags` instead
 */
const withTags = () => (WrappedComponent) => {
  class WithTags extends PureComponent {
    render() {
      return (
        <WithTagsBase
          render={(tags) => <WrappedComponent tags={tags} {...this.props} />}
        />
      );
    }
  }

  return WithTags;
};

export default withTags;
