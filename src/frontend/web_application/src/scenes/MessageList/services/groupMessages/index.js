const getDay = (datetime) => {
  const today = new Date(datetime);
  today.setHours(0, 0, 0, 0);

  return today;
};

const groupMessages = messages => messages
  .reduce((acc, message) => {
    const datetime = new Date(message.date_sort);
    const date = getDay(datetime);
    const accMessages = acc[date.toISOString()] || [];

    return {
      ...acc,
      [date.toISOString()]: [
        ...accMessages,
        message,
      ],
    };
  }, {});

export default groupMessages;
