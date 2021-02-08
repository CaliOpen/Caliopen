import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import {
  requestPublicKeys,
  createPublicKey,
  updatePublicKey,
  deletePublicKey,
} from '../../../../store/modules/public-key';
import { notifyError } from '../../../../modules/userNotify';
import { tryCatchAxiosAction } from '../../../../services/api-client';
import Presenter from './presenter';

const mapStateToProps = (state, ownProps) => ({
  initialValues: ownProps.publicKey,
  form: ownProps.publicKey
    ? `public-key-${ownProps.publicKey.key_id}`
    : 'public-key-new',
});

const makeHandleSubmit = (props, dispatch) => async (values) => {
  const { contactId, publicKey, onSuccess } = props;

  try {
    if (publicKey) {
      const { key_id: publicKeyId, label } = publicKey;

      await tryCatchAxiosAction(() =>
        dispatch(
          updatePublicKey({
            contactId,
            publicKey: { ...values, publicKeyId },
            original: { label },
          })
        )
      );
    } else {
      await tryCatchAxiosAction(() =>
        dispatch(createPublicKey({ contactId, publicKey: values }))
      );
    }

    onSuccess();
  } catch (err) {
    const { message } = err[0];

    dispatch(notifyError({ message }));
  }
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  ...bindActionCreators(
    {
      requestPublicKeys,
      deletePublicKey,
    },
    dispatch
  ),
  onSubmit: makeHandleSubmit(ownProps, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm()
)(Presenter);
