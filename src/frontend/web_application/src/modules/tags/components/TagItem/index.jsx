import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { Badge } from '../../../../components';
import { getTagLabel } from '../../services/getTagLabel';

import './style.scss';

@withI18n()
class TagItem extends Component {
  static propTypes = {
    tag: PropTypes.shape({}).isRequired,
    onDelete: PropTypes.func.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  state = {
    isTagCollectionUpdating: false,
  };

  handleDeleteTag = async () => {
    const { onDelete, tag } = this.props;

    this.setState({ isTagCollectionUpdating: true });
    await onDelete({ tag });
    this.setState({ isTagCollectionUpdating: false });
  };

  render() {
    const { tag, i18n } = this.props;

    return (
      <Badge
        className="m-tag-item"
        onDelete={this.handleDeleteTag}
        isLoading={this.state.isTagCollectionUpdating}
        ariaLabel={i18n._('tags.action.remove', null, { defaults: 'Remove' })}
      >
        {getTagLabel(i18n, tag)}
      </Badge>
    );
  }
}

export default TagItem;
