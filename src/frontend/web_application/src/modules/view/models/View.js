export class View {
  id;

  condition;

  label;

  isFetching = false;

  constructor(props = {}) {
    Object.assign(this, props);
  }

  has = ({ message }) => {
    const { propertyName, value } = this.condition;

    return message && message[propertyName] === value;
  };

  getRequestParams = () => {
    const { propertyName, value } = this.condition;

    return {
      [propertyName]: value,
    };
  };
}
