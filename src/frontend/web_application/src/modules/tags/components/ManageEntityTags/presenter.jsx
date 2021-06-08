import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TagsForm from '../TagsForm';
import WithTags from '../WithTags';
import { getCleanedTagCollection } from '../../services/getTagLabel';

class ManageEntityTags extends PureComponent {
  static propTypes = {
    entity: PropTypes.shape({}),
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    entity: undefined,
  };

  render() {
    const { entity, onChange } = this.props;

    return (
      <WithTags
        render={(tags) => (
          <TagsForm
            tagCollection={
              !entity || !entity.tags
                ? []
                : // XXX: useful? may be pass entity.tags directly
                  getCleanedTagCollection(tags, entity.tags)
            }
            updateTags={onChange}
          />
        )}
      />
    );
  }
}

export default ManageEntityTags;
