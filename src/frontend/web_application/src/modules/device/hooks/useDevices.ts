import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'src/store/reducer';
import { requestDevices } from '../actions/requestDevices';
import {
  selectDevices,
  selectDidInvalidate,
  selectIsFetching,
} from '../selectors';

export function useDevices() {
  const dispatch = useDispatch();
  const devices = useSelector(selectDevices);
  const isFetching = useSelector(selectIsFetching);
  const didInvalidate = useSelector(selectDidInvalidate);

  React.useEffect(() => {
    if (!isFetching && (devices.length === 0 || didInvalidate)) {
      dispatch(requestDevices());
    }
  }, [devices, isFetching, didInvalidate]);

  return {
    devices,
    isFetching,
  };
}
