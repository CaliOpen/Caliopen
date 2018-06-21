import { deleteMessage as deleteMessageBase, removeFromCollection, invalidateAll } from '../../../store/modules/message';

export const deleteMessage = ({ message }) => async (dispatch) => {
  try {
    const result = await dispatch(deleteMessageBase({ message }));
    // this must be placed after the real deletion in order to prevent re-render of connected
    // components and children
    dispatch(removeFromCollection({ message }));

    return result;
  } catch (err) {
    await dispatch(invalidateAll());

    return Promise.reject(err);
  }
};
