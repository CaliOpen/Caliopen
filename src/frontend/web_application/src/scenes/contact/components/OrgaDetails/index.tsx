import * as React from "react";
import { Trans } from "@lingui/react";
import PropTypes from "prop-types";

function OrgaDetails(props) {
  const { organization } = props;
  const department = organization.department
    ? ` (${organization.department})`
    : "";
  let organizationDescription = `${
    organization.job_description || organization.name
  } ${department}`;

  if (organization.job_description && organization.name) {
    const { job_description: jobDesc, name: orgaName } = organization;

    // @ts-expect-error ts-migrate(2322) FIXME: Type 'Element' is not assignable to type 'string'.
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

OrgaDetails.propTypes = {
  organization: PropTypes.shape({}).isRequired,
};

export default OrgaDetails;
