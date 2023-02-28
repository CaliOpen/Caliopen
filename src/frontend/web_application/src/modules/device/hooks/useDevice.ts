import { useSelector } from 'src/store/reducer';
import { selectDevice } from '../selectors';
import { useDevices } from './useDevices';

export function useDevice(id: string) {
  const { isFetching } = useDevices();
  const device = useSelector((state) => selectDevice(state, id));

  return {
    isFetching,
    device,
  };
}
