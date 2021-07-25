/* eslint-disable */
// unused for now
import * as React from 'react';
import { withI18n, withI18nProps } from '@lingui/react';
import {
  Section,
  PageTitle,
  // MultidimensionalPi,
  TextList,
  TextItem,
} from '../../components';

import './style.scss';

type Props = withI18nProps;

function UserPrivacy({ i18n }: Props) {
  const fakePi = { technic: 87, context: 45, comportment: 25 };

  const privacyTips = [
    {
      name: 'userTip',
      content:
        'Haec dum oriens diu perferret, caeli reserato tepore Constantiu',
    },
    {
      name: 'contactTip',
      content:
        'Consulatu suo septies et Caesaris ter egressus Arelate Valentiam',
    },
    {
      name: 'deviceTip',
      content:
        'Gundomadum et Vadomarium fratres Alamannorum reges arma moturus',
    },
    {
      name: 'tutorialTip',
      content: 'Quorum crebris excursibus vastabantur confines limitibu.',
    },
  ];

  return (
    <div className="s-user-privacy">
      <PageTitle />

      {/* <MultidimensionalPi className="s-user-privacy__pi" pi={fakePi} /> */}

      <Section
        className="s-user-privacy__info"
        title={i18n._('user.privacy.improve_pi', undefined, {
          defaults: 'Improve your privacy index',
        })}
      >
        <TextList className="s-user-privacy__tips">
          {privacyTips.map((tip) => (
            <TextItem className="s-user-privacy__tip" key={tip.name}>
              {tip.content}
            </TextItem>
          ))}
        </TextList>
      </Section>
    </div>
  );
}

export default withI18n()(UserPrivacy);
