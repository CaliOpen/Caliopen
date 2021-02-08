import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Trans, withI18n } from '@lingui/react';
import { Link, Title, Button, Modal } from '../../components';
import './style.scss';

const URL_DEVICES = '/settings/devices';

/* eslint-disable */
/* const MODAL_CONTENT_FR = (<p>
  <p>Pour évaluer le degré de confidentialité de vos messages, Caliopena besoin d'en savoir plus sur le terminal sur lequel vous allez lesafficher: par nature, un terminal mobile n'est pas aussi confidential qu'un terminal fixe (parce que vous risquez de l'utiliser en public plus souvent).<br />De même un terminal partagé (ordinateur en libre accès dans un lieu public, par exemple) ne peut pas être considéré comme étant un outil aussi confidentiel que l'ordinateur personnel que vous êtes seul à
utiliser.</p>
  <p>Caliopen va tenir compte des informations que vous allez saisir ici pour évaluer si l'affichage de vos essages les plus confidentiels est possible sans risque d'être lus par des tiers : par défaut seuls les messages adaptés à la confidentialité du terminal utilisé seront affichés.</p>
  <p>Il est donc important de décrire précisément les attributs d'un terminal depuis lequel vous ne vous êtes jamais connecté, de manière à ce que Caliopen puisse protéger au mieux votre vie privée.</p>
</p>); */
/* eslint-enable */

@withI18n()
class NewDeviceInfo extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ _: PropTypes.func }).isRequired,
  };

  state = {
    isModalOpen: false,
  };

  handleOpenModal = () => {
    this.setState({
      isModalOpen: true,
    });
  };

  handleCloseModal = () => {
    this.setState({
      isModalOpen: false,
    });
  };

  renderModal = () => {
    const { i18n } = this.props;

    return (
      <Modal
        isOpen={this.state.isModalOpen}
        className="s-new-device-info__modal"
        title={i18n._('new-device-info.modal.title', null, {
          defaults: 'About new device',
        })}
        onClose={this.handleCloseModal}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: i18n._('new-device-info.learn-more.content', null, {
              defaults:
                "<p>In order to compute the Privacy Index (PI) of a message, Caliopen needs to know more about the terminal you're using to consult said message: by nature a laptop isn't as private as a desktop (since you will be using your laptop in public more often).</p><p>Likewise a shared terminal (e.g. a free access computer in a public place) cannot be considered as private as your personal computer only you use.</p><p>Caliopen will take into account the informations you enter on the next screen, to better assess whether your more private messages can be displayed without a risk to be read by a third party: by default only the messages adapted to your terminal's privacy will be displayed.</p><p>It is therefore important to precisely describe a terminal's attributes on the first use, so that Caliopen can more effectively protect your privacy.</p>",
            }),
          }}
        />
      </Modal>
    );
  };

  render() {
    return (
      <div className="s-new-device-info">
        <Title className="s-new-device-info__title">
          <Trans id="new-device-info.title">
            It&apos;s the first time you attemp to connect to your Caliopen
            account on this client.
          </Trans>
        </Title>
        <Trans id="new-device-info.text">
          To respect privacy and security rules, your discussion history will
          not appear here for now. Please verify this device and eventually set
          restrictions from your trust client to use Caliopen on this client.
        </Trans>

        <div className="s-new-device-info__actions">
          <Button
            onClick={this.handleOpenModal}
            className="s-new-device-info__learn-more"
          >
            <Trans id="new-device-info.learn-more">Learn more</Trans>
          </Button>
          {this.renderModal()}
          <Link plain button to={URL_DEVICES}>
            <Trans id="new-device-info.i-understand">I understand</Trans>
          </Link>
        </div>
      </div>
    );
  }
}

export default NewDeviceInfo;
