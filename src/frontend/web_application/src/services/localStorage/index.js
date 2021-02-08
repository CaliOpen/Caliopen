export const getLocalstorage = () => {
  if (typeof window !== 'object' || !window.localStorage) {
    throw new Error('No window nor LocalStorage is available.');
  }

  return {
    findAll: (namespace) =>
      Object.keys(window.localStorage)
        .filter((name) => name.indexOf(namespace) === 0)
        .map((name) => ({
          id: name.replace(`${namespace}.`, ''),
          value: window.localStorage.getItem(name),
        })),
    findOne: (namespace, id) =>
      window.localStorage.getItem(`${namespace}.${id}`),
    save: (namespace, id, value) =>
      window.localStorage.setItem(`${namespace}.${id}`, value),
    remove: (namespace, id) =>
      window.localStorage.removeItem(`${namespace}.${id}`),
  };
};
