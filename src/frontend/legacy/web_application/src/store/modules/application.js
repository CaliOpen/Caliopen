export const SWITCH_APPLICATION = 'co/application/SWITCH_APPLICATION';

const initialState = { applicationName: 'discussions' };

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SWITCH_APPLICATION:
      return { applicationName: action.payload.applicationName };
    default:
      return state;
  }
}

export function switchApplication(applicationName) {
  return {
    type: SWITCH_APPLICATION,
    payload: { applicationName },
  };
}
