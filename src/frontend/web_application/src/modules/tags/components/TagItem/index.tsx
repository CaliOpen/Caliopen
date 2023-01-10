import React, { Component } from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import { Badge } from 'src/components';
import { getTagLabel } from '../../services/getTagLabel';

import './style.scss';
import { TagMixed } from '../../query';
import { TagPayload } from '../../types';

interface Props extends withI18nProps {
  tag: TagMixed;
  onDelete: (tag: TagMixed) => void | Promise<void>;
}
class TagItem extends Component<Props> {
  handleDeleteTag = async () => {
    const { onDelete, tag } = this.props;

    onDelete(tag);
  };

  render() {
    const { tag, i18n } = this.props;

    return (
      <Badge
        className="m-tag-item"
        onDelete={this.handleDeleteTag}
        ariaLabel={i18n._(/* i18n */ 'tags.action.remove', undefined, {
          message: 'Remove',
        })}
      >
        {tag.name ? getTagLabel(i18n, tag as TagPayload) : tag.label}
      </Badge>
    );
  }
}

export default withI18n()(TagItem);
