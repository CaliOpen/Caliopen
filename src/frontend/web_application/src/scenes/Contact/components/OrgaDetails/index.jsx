import React, { PureComponent } from 'react';
import { Trans } from '@lingui/react';
import PropTypes from 'prop-types';

class OrgaDetails extends PureComponent {
  static propTypes = {
    organization: PropTypes.shape({}).isRequired,
  };

  render() {
    const { organization } = this.props;
    const department = organization.department
      ? ` (${organization.department})`
      : '';
    let organizationDescription = `${
      organization.job_description || organization.name
    } ${department}`;

    if (organization.job_description && organization.name) {
      const { job_description: jobDesc, name: orgaName } = organization;

      organizationDescription = (
        <Trans
          id="orga-details.job.desc-full"
          values={{
            jobDesc,
            orgaName,
            department,
          }}
        >
          {jobDesc} at {orgaName} {department}
        </Trans>
      );
    }

    return <span title={organization.label}>{organizationDescription}</span>;
  }
}

export default OrgaDetails;
