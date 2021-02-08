import { Component } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { View } from '../../models/View';
import { getConfig } from '../../config';

@withI18n()
class WithViewModel extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
    viewId: PropTypes.string.isRequired,
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  getView = () => {
    const { i18n, viewId } = this.props;
    const viewConfig = getConfig(i18n).find((cfg) => cfg.id === viewId);

    if (!viewConfig) {
      throw new Error(`View not found "${viewId}"`);
    }

    return new View(viewConfig);
  };

  render() {
    const { render } = this.props;
    const view = this.getView();

    return render({
      view,
    });
  }
}

export default WithViewModel;
