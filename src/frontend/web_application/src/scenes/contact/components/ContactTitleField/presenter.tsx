import * as React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { formatName } from "../../../../services/contact";
import { RawButton } from "../../../../components";
import "./style.scss";

function ContactTitleField(props) {
  const { contact, contactDisplayFormat: format, className, onClick } = props;

  return (
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: any; className: any; onClick: an... Remove this comment to see the full error message
    <RawButton
      className={classnames(className, "s-contact-title-field")}
      onClick={onClick}
    >
      {formatName({ contact, format })}
    </RawButton>
  );
}

ContactTitleField.propTypes = {
  contact: PropTypes.shape({}).isRequired,
  contactDisplayFormat: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

ContactTitleField.defaultProps = {
  className: undefined,
};

export default ContactTitleField;
