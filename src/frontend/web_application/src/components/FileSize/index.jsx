import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Trans, NumberFormat } from '@lingui/react';

class FileSize extends Component {
  static propTypes = {
    size: PropTypes.number.isRequired,
  };

  renderB() {
    const { size } = this.props;

    return <Trans id="file.size.B" defaults="{size} B" values={{ size }} />;
  }

  renderKB() {
    const { size } = this.props;
    const value = Math.round(size / 10) / 100;

    return (
      <Trans
        id="file.size.kB"
        defaults="<0/> kB"
        components={[
          <NumberFormat format={{ maximumFractionDigits: 1 }} value={value} />,
        ]}
      />
    );
  }

  renderMB() {
    const { size } = this.props;
    const value = Math.round(size / 10000) / 100;

    return (
      <Trans
        id="file.size.mB"
        defaults="<0/> mB"
        components={[
          <NumberFormat format={{ maximumFractionDigits: 1 }} value={value} />,
        ]}
      />
    );
  }

  renderGB() {
    const { size } = this.props;
    const value = Math.round(size / 10000000) / 100;

    return (
      <Trans
        id="file.size.gB"
        defaults="<0/> gB"
        components={[
          <NumberFormat format={{ maximumFractionDigits: 1 }} value={value} />,
        ]}
      />
    );
  }

  renderTB() {
    const { size } = this.props;
    const value = Math.round(size / 10000000000) / 100;

    return (
      <Trans
        id="file.size.tB"
        defaults="<0/> tB"
        components={[
          <NumberFormat format={{ maximumFractionDigits: 1 }} value={value} />,
        ]}
      />
    );
  }

  render() {
    const { size } = this.props;

    if (size / 100 < 1) {
      return this.renderB();
    }

    if (size / 1000000 < 1) {
      return this.renderKB();
    }

    if (size / 1000000000 < 1) {
      return this.renderMB();
    }

    if (size / 1000000000000 < 1) {
      return this.renderGB();
    }

    return this.renderTB();
  }
}

export default FileSize;
