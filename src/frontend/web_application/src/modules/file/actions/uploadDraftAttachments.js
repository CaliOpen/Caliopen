import {
  uploadAttachment,
  requestMessage,
} from '../../../store/modules/message';
import { tryCatchAxiosPromise } from '../../../services/api-client';
import UploadFileAsFormField from '../services/uploadFileAsFormField';

export const uploadDraftAttachments = ({ message, attachments }) => async (
  dispatch
) => {
  try {
    await Promise.all(
      attachments.map((file) => {
        const attachment = new UploadFileAsFormField(file, 'attachment');

        return tryCatchAxiosPromise(
          dispatch(uploadAttachment({ message, attachment }))
        );
      })
    );

    return tryCatchAxiosPromise(dispatch(requestMessage(message.message_id)));
  } catch (err) {
    return Promise.reject(err);
  }
};
