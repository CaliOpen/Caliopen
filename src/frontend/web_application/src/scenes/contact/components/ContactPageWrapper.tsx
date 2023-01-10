import { Trans, withI18n, withI18nProps } from '@lingui/react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  ActionBar,
  ActionBarButton,
  ActionBarWrapper,
  Badge,
  Confirm,
  Modal,
  PageTitle,
  Spinner,
} from 'src/components';
import { Contact } from 'src/modules/contact/types';
import { ScrollDetector } from 'src/modules/scroll';
import { useCloseTab, useCurrentTab } from 'src/modules/tab';
import {
  getCleanedTagCollection,
  getTagLabel,
  ManageEntityTags,
  useTags,
} from 'src/modules/tags';
import { deleteContact, getQueryKeys } from 'src/modules/contact/query';
import { useMutation, useQueryClient } from 'react-query';
import { notifyError } from 'src/modules/userNotify';
import { useUser } from 'src/modules/user';

import '../style.scss';
import '../contact-action-bar.scss';
import '../contact-main-title.scss';

interface Props extends withI18nProps {
  children: React.ReactNode;
  hasActivity?: boolean;
  contact?: Contact;
  isEditing?: boolean;
}
function ContactPageWrapper({
  children,
  hasActivity,
  contact,
  i18n,
  isEditing,
}: Props): JSX.Element {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { push } = useHistory();
  const closeTab = useCloseTab();
  const currentTab = useCurrentTab();
  const [isTagModalOpen, setIsTagModalOpen] = React.useState(false);
  const { user } = useUser();
  const { tags } = useTags();

  const { mutateAsync, isLoading: isDeleting } = useMutation<
    unknown,
    unknown,
    string
  >(deleteContact, {
    onSuccess: () => {
      queryClient.removeQueries(
        getQueryKeys({ contactId: contact?.contact_id })
      );
      queryClient.invalidateQueries(getQueryKeys());
    },
  });

  const contactIsUser =
    contact?.contact_id &&
    user &&
    user.contact.contact_id === contact?.contact_id;

  const nbTags = contact?.tags?.length || 0;

  const handleDelete = async () => {
    if (!contact) {
      return;
    }

    try {
      await mutateAsync(contact.contact_id);
      push('/contacts');
      closeTab(currentTab);
    } catch (err) {
      dispatch(
        notifyError({
          message: (
            <Trans
              id="contact.feedback.unable_to_delete"
              message="Unable to delete the contact"
            />
          ),
        })
      );
    }
  };

  const handleClickEditContact = () => {
    if (!contact) {
      return;
    }
    push(`/contacts/${contact.contact_id}/edit`);
  };

  return (
    <div className="s-contact">
      <PageTitle />

      <ScrollDetector
        offset={136}
        render={(isSticky) => (
          <ActionBarWrapper isSticky={isSticky}>
            <ActionBar
              hr={false}
              isLoading={hasActivity || isDeleting}
              actionsNode={
                <div className="s-contact-action-bar">
                  {contact && (
                    <>
                      <Trans id="contact.action-bar.label" message="Contact:" />
                      {!contactIsUser && (
                        <Confirm
                          onConfirm={handleDelete}
                          title={
                            <Trans
                              id="contact.confirm-delete.title"
                              message="Delete the contact"
                            />
                          }
                          content={
                            <Trans
                              id="contact.confirm-delete.content"
                              message="The deletion is permanent, are you sure you want to delete this contact ?"
                            />
                          }
                          render={(confirm) => (
                            <ActionBarButton
                              onClick={confirm}
                              display="inline"
                              icon={
                                isDeleting ? (
                                  <Spinner
                                    svgTitleId="delete-contact-spinner"
                                    isLoading
                                    display="inline"
                                  />
                                ) : (
                                  'trash'
                                )
                              }
                              noDecoration
                            >
                              <Trans
                                id="contact.action.delete_contact"
                                message="Delete"
                              />
                            </ActionBarButton>
                          )}
                        />
                      )}
                      {/* TODO: replace by a link */}
                      {!isEditing && (
                        <ActionBarButton
                          onClick={handleClickEditContact}
                          display="inline"
                          noDecoration
                          icon="list-ul"
                        >
                          <Trans
                            id="contact.action.edit_contact"
                            message="Edit contact"
                          />
                        </ActionBarButton>
                      )}
                      <ActionBarButton
                        onClick={() => setIsTagModalOpen(true)}
                        display="inline"
                        noDecoration
                        icon="tag"
                      >
                        <Trans
                          id="contact.action.edit_tags"
                          message="Edit tags"
                        />
                      </ActionBarButton>
                      <Modal
                        isOpen={isTagModalOpen}
                        contentLabel={i18n._(
                          /* i18n */ 'tags.header.label',
                          undefined,
                          {
                            message: 'Tags',
                          }
                        )}
                        title={
                          <Trans
                            id="tags.header.title"
                            message="Tags <0>(Total: {nb})</0>"
                            values={{ nb: nbTags }}
                            components={[
                              <span className="m-tags-form__count" />,
                            ]}
                          />
                        }
                        onClose={() => setIsTagModalOpen(false)}
                      >
                        <ManageEntityTags type="contact" entity={contact} />
                      </Modal>
                    </>
                  )}
                </div>
              }
            />
          </ActionBarWrapper>
        )}
      />

      {contact?.tags && (
        <div className="s-contact__tags">
          {getCleanedTagCollection(tags, contact.tags).map((tag) => (
            <Badge
              key={tag.name}
              rightSpaced
              to={`/search-results?term=${getTagLabel(
                i18n,
                tag
              )}&doctype=contact`}
            >
              {getTagLabel(i18n, tag)}
            </Badge>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}

export default withI18n()(ContactPageWrapper);
