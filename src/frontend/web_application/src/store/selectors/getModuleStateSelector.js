export const getModuleStateSelector = (moduleName) => (state) => {
  if (!state[moduleName]) {
    throw new Error(`"${moduleName}" does not exist in redux store`);
  }

  return state[moduleName];
};
