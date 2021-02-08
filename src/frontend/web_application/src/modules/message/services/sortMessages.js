// Array.prototype.sort() is destructive, hence we need a copy of messages array.
export const sortMessages = (messages, reversed = false) =>
  [...messages].sort((a, b) => {
    if (reversed) {
      return new Date(b.date_sort) - new Date(a.date_sort);
    }

    return new Date(a.date_sort) - new Date(b.date_sort);
  });
