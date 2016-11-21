import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import Presenter from './presenter';

const userSelector = (state) => {
  if (state.user.user) {
    // eslint-disable-next-line no-console
    console.error('remove mock user', state.user);
  }

  return {
    name: 'Foo',
    contact: {
      title: 'Foobar',
    },
  };
};

const mapStateToProps = createSelector(
  [userSelector],
  user => ({ user })
);

export default connect(mapStateToProps)(Presenter);
