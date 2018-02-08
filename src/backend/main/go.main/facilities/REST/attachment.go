// Copyleft (ɔ) 2017 The Caliopen contributors.
// Use of this source code is governed by a GNU AFFERO GENERAL PUBLIC
// license (AGPL) that can be found in the LICENSE file.

package REST

import (
	"bytes"
	"errors"
	"fmt"
	"github.com/CaliOpen/Caliopen/src/backend/brokers/go.emails"
	. "github.com/CaliOpen/Caliopen/src/backend/defs/go-objects"
	"github.com/satori/go.uuid"
	"io"
)

func (rest *RESTfacility) AddAttachment(user *UserInfo, message_id, filename, content_type string, file io.Reader) (attachmentPath string, err error) {
	//check if message_id belongs to user and is a draft
	msg, err := rest.store.RetrieveMessage(user.User_id, message_id)
	if err != nil {
		return "", err
	}
	if !msg.Is_draft {
		return "", errors.New("message " + message_id + " is not a draft.")
	}

	//store temporary file in objectStore facility
	tmpAttachmentID := uuid.NewV4()
	url, size, err := rest.store.StoreAttachment(tmpAttachmentID.String(), file)
	if err != nil {
		return "", err
	}

	//update draft with new attachment references
	draftAttchmnt := Attachment{
		Content_type: content_type,
		File_name:    filename,
		Is_inline:    false,
		Size:         size,
		URL:          url,
	}
	attchmntIndex := len(msg.Attachments)
	msg.Attachments = append(msg.Attachments, draftAttchmnt)
	//update store
	fields := make(map[string]interface{})
	fields["Attachments"] = msg.Attachments
	err = rest.store.UpdateMessage(msg, fields)
	if err != nil {
		//roll-back attachment storage before returning the error
		rest.store.DeleteAttachment(url)
		return "", err
	}
	//update index
	err = rest.index.UpdateMessage(user, msg, fields)
	if err != nil {
		//roll-back attachment storage before returning the error
		fields["Attachments"] = msg.Attachments[:attchmntIndex]
		rest.store.UpdateMessage(msg, fields)
		rest.store.DeleteAttachment(url)
		return "", err
	}

	attachmentPath = fmt.Sprintf("%s/attachments/%d", message_id, attchmntIndex)
	return
}

func (rest *RESTfacility) DeleteAttachment(user *UserInfo, message_id string, attchmtIndex int) error {
	//check if message_id belongs to user and is a draft and index is consistent
	msg, err := rest.store.RetrieveMessage(user.User_id, message_id)
	if err != nil {
		return err
	}

	if !msg.Is_draft {
		return errors.New("message " + message_id + " is not a draft.")
	}
	if attchmtIndex < 0 || attchmtIndex > (len(msg.Attachments)-1) {
		return errors.New(fmt.Sprintf("index %d for message %s is not consistent.", attchmtIndex, message_id))
	}

	//remove attachment's reference from draft
	attachment_uri := msg.Attachments[attchmtIndex].URL
	msg.Attachments = append(msg.Attachments[:attchmtIndex], msg.Attachments[attchmtIndex+1:]...)

	//update store
	fields := make(map[string]interface{})
	fields["Attachments"] = msg.Attachments
	rest.store.UpdateMessage(msg, fields)
	if err != nil {
		return err
	}
	//update index
	err = rest.index.UpdateMessage(user, msg, fields)

	//remove temporary file from object store
	err = rest.store.DeleteAttachment(attachment_uri)
	if err != nil {
		return errors.New(fmt.Sprintf("failed to remove temp attachment at uri '%s' with error <%s>", attachment_uri, err.Error()))
	}

	return nil
}

// returns an io.Reader and metadata to conveniently read the attachment
func (rest *RESTfacility) OpenAttachment(user_id, message_id string, attchmtIndex int) (contentType string, size int, content io.Reader, err error) {
	//check if message_id belongs to user and index is consistent
	msg, err := rest.store.RetrieveMessage(user_id, message_id)
	if err != nil {
		return "", 0, nil, err
	}
	if attchmtIndex < 0 || attchmtIndex > (len(msg.Attachments)-1) {
		return "", 0, nil, errors.New(fmt.Sprintf("index %d for message %s is not consistent.", attchmtIndex, message_id))
	}
	contentType = msg.Attachments[attchmtIndex].Content_type
	size = msg.Attachments[attchmtIndex].Size

	// create a Reader
	// either from object store (draft context)
	// or from raw message's mime part (non-draft context)
	if msg.Is_draft {
		attachment, e := rest.store.GetAttachment(msg.Attachments[attchmtIndex].URL)
		if e != nil {
			return "", 0, nil, e
		}
		content = attachment
		return

	} else {
		rawMsg, e := rest.store.GetRawMessage(msg.Raw_msg_id.String())
		if e != nil {
			return "", 0, nil, e
		}
		json_email, e := email_broker.EmailToJsonRep(rawMsg.Raw_data)
		if e != nil {
			return "", 0, nil, e
		}
		attachments, e := json_email.ExtractAttachments(attchmtIndex)
		if e != nil {
			return "", 0, nil, e
		}
		content = bytes.NewReader(attachments[0])
		return
	}
}
