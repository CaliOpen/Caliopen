import { Trans, useLingui } from '@lingui/react';
import * as React from 'react';
import { Button, Modal } from 'src/components';

interface Props {
  isModalOpen: boolean;
  handleCloseModal: () => void;
}

export default function PiwikModal({ isModalOpen, handleCloseModal }: Props) {
  const { i18n } = useLingui();

  return (
    <Modal
      className="s-signup__modal"
      isOpen={isModalOpen}
      contentLabel={i18n._(/* i18n */ 'signup.privacy.modal.label', undefined, {
        message: 'About Piwik',
      })}
      title={i18n._(/* i18n */ 'signup.privacy.modal.label', undefined, {
        message: 'About Piwik',
      })}
      onClose={handleCloseModal}
    >
      <p>
        <Trans
          id="signup.privacy.modal.title"
          message="Caliopen is under development !"
        />
      </p>
      <p>
        <Trans
          id="signup.privacy.modal.text.alpha_tester"
          message="As an alpha-tester your contribution is precious and will allow us to finalize Caliopen."
        />
      </p>
      <p>
        <Trans
          id="signup.privacy.modal.text.get_data"
          message="For this purpose, you grant us the right to collect data related to your usage (displayed pages, timings, clics, scrolls ...almost everything that can be collected!)."
        />
      </p>
      <p>
        <Trans
          id="signup.privacy.modal.text.desactivate_dnt"
          message="You need to deactivate the DoNotTrack setting from your browser preferences (more informations at http://donottrack.us), as well as allowing cookies."
        />
      </p>
      <p>
        <Trans
          id="signup.privacy.modal.text.piwik"
          message="We use https://piwik.org/ the open-source analytics plateform. The collected data will not be disclosed to any third party, and will stay scoped to Caliopen's alpha testing purpose."
        />
      </p>
      <Button shape="plain" onClick={handleCloseModal}>
        <Trans id="signup.privacy.modal.close" message="Ok got it !" />
      </Button>
    </Modal>
  );
}
