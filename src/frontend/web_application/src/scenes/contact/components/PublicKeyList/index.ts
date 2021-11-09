import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
  requestPublicKeys,
  deletePublicKey,
} from '../../../../store/modules/public-key';
import Presenter from './presenter';

const contactIdSelector = (state, ownProps) => ownProps.contactId;
const publicKeysSelector = (state) => state.publicKey;

const mapStateToProps = createSelector(
  [contactIdSelector, publicKeysSelector],
  (contactId, publicKeysState) => {
    const keyState = publicKeysState[contactId];

    return {
      publicKeys: keyState ? keyState.keys : [],
      didInvalidate: keyState ? keyState.didInvalidate : false,
      isFetching: keyState ? keyState.isFetching : false,
      needsFetching: !keyState,
    };
  }
);

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(
    {
      requestPublicKeys,
      deletePublicKey,
    },
    dispatch
  ),
});

// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof PublicKeyList' is not ass... Remove this comment to see the full error message
export default compose(connect(mapStateToProps, mapDispatchToProps))(Presenter);
