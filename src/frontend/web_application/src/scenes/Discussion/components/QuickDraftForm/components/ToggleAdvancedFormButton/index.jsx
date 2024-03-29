import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from '@lingui/react';
import { Button, Icon, Spinner } from '../../../../../../components';
import './toggle-advanced-draft-button.scss';

function ToggleAdvancedFormButton({
  i18n,
  handleToggleAdvancedForm,
  hasActivity,
}) {
  return (
    <Button
      display="expanded"
      shape="plain"
      className="m-toggle-advanced-draft-button"
      title={i18n._(/* i18n */ 'draft-message.action.toggle-advanced', null, {
        message: 'Toggle advanced or quick message form',
      })}
      onClick={handleToggleAdvancedForm}
      disabled={hasActivity}
    >
      {hasActivity ? (
        <Spinner
          svgTitleId="toggle-advanced-draft-spinner"
          display="inline"
          theme="bright"
        />
      ) : (
        <Icon type="envelope" />
      )}
      <Icon type="caret-down" />
    </Button>
  );
}

ToggleAdvancedFormButton.propTypes = {
  i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  handleToggleAdvancedForm: PropTypes.func.isRequired,
  advancedForm: PropTypes.bool,
  hasActivity: PropTypes.bool,
};
ToggleAdvancedFormButton.defaultProps = {
  advancedForm: false,
  hasActivity: false,
};

export default withI18n()(ToggleAdvancedFormButton);
