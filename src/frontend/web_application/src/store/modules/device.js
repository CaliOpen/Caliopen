import calcObjectForPatch from '../../services/api-patch';

export const SET_NEW_DEVICE = 'co/device/SET_NEW_DEVICE';
export const SET_DEVICE_GENERATED = 'co/device/SET_DEVICE_GENERATED';
export const REQUEST_DEVICES = 'co/device/REQUEST_DEVICES';
export const REQUEST_DEVICES_SUCCESS = 'co/device/REQUEST_DEVICES_SUCCESS';
export const REQUEST_DEVICES_FAIL = 'co/device/REQUEST_DEVICES_FAIL';
export const INVALIDATE_DEVICES = 'co/device/INVALIDATE_DEVICES';
export const REQUEST_DEVICE = 'co/device/REQUEST_DEVICE';
export const CREATE_DEVICE = 'co/device/CREATE_DEVICE';
export const UPDATE_DEVICE = 'co/device/UPDATE_DEVICE';
export const REMOVE_DEVICE = 'co/device/REMOVE_DEVICE';
export const VERIFY_DEVICE = 'co/device/VERIFY_DEVICE';
export const VALIDATE_DEVICE = 'co/device/VALIDATE_DEVICE';

export function setNewDevice(isNew) {
  return {
    type: SET_NEW_DEVICE,
    payload: {
      isNew,
    },
  };
}

export function setDeviceGenerated(isGenerated) {
  return {
    type: SET_DEVICE_GENERATED,
    payload: {
      isGenerated,
    },
  };
}

export function requestDevices() {
  return {
    type: REQUEST_DEVICES,
    payload: {
      request: {
        url: '/api/v2/devices',
      },
    },
  };
}

export function createDevice({ device }) {
  return {
    type: CREATE_DEVICE,
    payload: {
      request: {
        method: 'post',
        url: '/api/v2/devices',
        data: device,
      },
    },
  };
}

export function requestDevice({ deviceId }) {
  return {
    type: REQUEST_DEVICE,
    payload: {
      request: {
        url: `/api/v2/devices/${deviceId}`,
      },
    },
  };
}

export function invalidate() {
  return {
    type: INVALIDATE_DEVICES,
    payload: {},
  };
}

export function removeDevice({ device }) {
  return {
    type: REMOVE_DEVICE,
    payload: {
      request: {
        method: 'delete',
        url: `/api/v2/devices/${device.device_id}`,
      },
    },
  };
}

// TODO: move to a device's module action
export function verifyDevice({ device }) {
  return {
    type: VERIFY_DEVICE,
    payload: {
      request: {
        method: 'post',
        url: `/api/v2/devices/${device.device_id}/actions`,
        data: {
          actions: ['device-validation'],
          params: { channel: 'email' },
        },
      },
    },
  };
}

export function requestDeviceVerification({ token }) {
  return {
    type: VALIDATE_DEVICE,
    payload: {
      request: {
        method: 'get',
        url: `/api/v2/validate-device/${token}`,
      },
    },
  };
}

export function updateDevice({ device, original }) {
  const data = calcObjectForPatch(device, original);

  return {
    type: UPDATE_DEVICE,
    payload: {
      request: {
        method: 'patch',
        url: `/api/v2/devices/${device.device_id}`,
        data,
      },
    },
  };
}

function devicesByIdReducer(state, action) {
  switch (action.type) {
    case REQUEST_DEVICES_SUCCESS:
      return action.payload.data.devices.reduce(
        (acc, device) => ({
          ...acc,
          [device.device_id]: device,
        }),
        {}
      );
    default:
      return state;
  }
}

function devicesReducer(state, action) {
  switch (action.type) {
    case REQUEST_DEVICES_SUCCESS:
      return action.payload.data.devices.map((device) => device.device_id);
    default:
      return state;
  }
}

const initialState = {
  isFetching: false,
  didInvalidate: false,
  devices: [],
  devicesById: {},
  total: 0,
  isNew: false,
  isGenerated: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_NEW_DEVICE:
      return { ...state, isNew: action.payload.isNew };
    case SET_DEVICE_GENERATED:
      return { ...state, isGenerated: action.payload.isGenerated };
    case REQUEST_DEVICES:
      return { ...state, isFetching: true };
    case REQUEST_DEVICES_SUCCESS:
      return {
        ...state,
        isFetching: false,
        didInvalidate: false,
        devices: devicesReducer(state.devices, action),
        devicesById: devicesByIdReducer(state.devicesById, action),
        total: action.payload.data.total,
      };
    case INVALIDATE_DEVICES:
      return { ...state, didInvalidate: true };
    default:
      return state;
  }
}
