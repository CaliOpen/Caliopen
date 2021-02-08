import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../Button';
import FileSize from '../../../FileSize';

class File extends PureComponent {
  static propTypes = {
    onRemove: PropTypes.func.isRequired,
    file: PropTypes.shape({
      name: PropTypes.string,
      size: PropTypes.number,
    }).isRequired,
  };

  static defaultProps = {};

  render() {
    const { file, onRemove } = this.props;

    return (
      <div className="m-input-file-group__file">
        <Button
          className="m-input-file-group__file__remove"
          icon="remove"
          value={file}
          onClick={onRemove}
          shape="plain"
        />
        <span className="m-input-file-group__file__name">{file.name}</span>
        <span className="m-input-file-group__file__size">
          <FileSize size={file.size} />
        </span>
      </div>
    );
  }
}

export default File;
