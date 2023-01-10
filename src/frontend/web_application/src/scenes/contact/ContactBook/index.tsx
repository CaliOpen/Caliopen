import * as React from 'react';
import classnames from 'classnames';
import { Trans, useLingui } from '@lingui/react';
import { useMutation, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { notifyError } from 'src/modules/userNotify';
import {
  ContactList,
  DEFAULT_SORT_DIR,
  useContacts,
} from 'src/modules/contact';
import { useSearchParams } from 'src/modules/routing';
import {
  PageTitle,
  Spinner,
  Button,
  ActionBarWrapper,
  ActionBar,
  Checkbox,
  Link,
  SidebarLayout,
  NavList,
  NavItem,
  Confirm,
  Modal,
} from 'src/components';
import { withScrollManager, ScrollDetector } from 'src/modules/scroll';
import {
  TagsForm,
  getCleanedTagCollection,
  getTagNamesInCommon,
  useTags,
} from 'src/modules/tags';
import {
  getQueryKeys,
  deleteContact as baseDeleteContact,
} from 'src/modules/contact/query';
import { TagMixed } from 'src/modules/tags/query';
import TagList from './components/TagList';
import ImportContactButton from './components/ImportContactButton';
import './style.scss';
import './contact-book-menu.scss';
import { useUpdateContactsTags } from './query';

function getFilteredContacts(contactList, tag) {
  if (tag === '') {
    return contactList;
  }

  return contactList.filter(
    (contact) => contact.tags && contact.tags.includes(tag)
  );
}

const EMPTY_ARRAY: string[] = [];
const EMPTY_ENTITIES = [];

function ContactBook() {
  const { i18n } = useLingui();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { tags: userTags } = useTags();
  const { tag: tagSearched = '' } = useSearchParams();

  const sortDir = DEFAULT_SORT_DIR;
  const [selectedEntitiesIds, setSelectedEntitiesIds] =
    React.useState(EMPTY_ARRAY);
  const [isTagModalOpen, setIsTagModalOpen] = React.useState(false);

  const { data: contactsBase, refetch, isFetching } = useContacts();
  const { mutateAsync: updateContacsTags } = useUpdateContactsTags();

  const contacts = getFilteredContacts(contactsBase, tagSearched);

  const { mutate: deleteContact, isLoading: isDeleting } = useMutation<
    unknown,
    unknown,
    string
  >(baseDeleteContact, {
    onSuccess: () => {
      queryClient.invalidateQueries(getQueryKeys());
    },
  });

  const onSelectEntity = (type: 'add' | 'remove', id: string) => {
    if (type === 'add') {
      setSelectedEntitiesIds((prev) => [...prev, id]);
    }

    if (type === 'remove') {
      setSelectedEntitiesIds((prev) => [...prev].filter((item) => item !== id));
    }
  };

  const onSelectAllEntities = (checked) => {
    const contactIds = getFilteredContacts(contacts, tagSearched).map(
      ({ contact_id: contactId }) => contactId
    );

    setSelectedEntitiesIds(checked ? contactIds : EMPTY_ARRAY);
  };

  const handleSelectAllEntitiesChange = (ev) => {
    const { checked } = ev.target;
    onSelectAllEntities(checked);
  };

  const handleDeleteContacts = async () => {
    const selectedContactIds = new Set(selectedEntitiesIds);
    selectedContactIds.forEach((id) => {
      deleteContact(id, {
        onSuccess: () => {
          // This will executed only one time at the end of the promises pool
          setSelectedEntitiesIds(EMPTY_ARRAY);
        },
        onError: () => {
          dispatch(
            notifyError({
              message: (
                <Trans
                  id="contact-book.feedback.unable_to_delete"
                  message="Unable to delete the contact"
                />
              ),
            })
          );
        },
      });
    });
  };

  const handleUploadSuccess = () => {
    refetch();
  };

  const handleOpenTags = () => {
    setIsTagModalOpen(true);
  };

  const handleCloseTags = () => {
    setIsTagModalOpen(false);
  };

  const handleTagsChange = async (tags: TagMixed[]) => {
    try {
      await updateContacsTags({ contactIds: selectedEntitiesIds, tags });
      setIsTagModalOpen(false);
    } catch (err) {
      dispatch(
        notifyError({
          message: (
            <Trans
              id="contact-book.feedback.unable_to_delete"
              message="Unable to save tags"
            />
          ),
        })
      );
    }
  };

  const selectedEntitiesIdsSet = new Set(selectedEntitiesIds);
  const selectedEntities =
    contacts?.filter((contact) =>
      selectedEntitiesIdsSet.has(contact.contact_id)
    ) || EMPTY_ENTITIES;

  const tagNamesInCommon = getTagNamesInCommon(selectedEntities);
  const tagsInCommon = getCleanedTagCollection(userTags, tagNamesInCommon);

  const count = selectedEntitiesIds.length;
  const totalCount = contacts?.length || 0;

  return (
    <div className="s-contact-book">
      <PageTitle
        title={i18n._(/* i18n */ 'header.menu.contacts', undefined, {
          message: 'Contacts',
        })}
      />
      <ScrollDetector
        offset={136}
        render={(isSticky) => (
          <ActionBarWrapper isSticky={isSticky}>
            <ActionBar
              isLoading={isFetching}
              actionsNode={
                <div className="s-contact-book-menu">
                  {count > 0 && (
                    <>
                      <span className="s-contact-book-menu__label">
                        <Trans
                          id="contact-book.contacts.selected"
                          values={{ count, totalCount }}
                          message="{count, plural, one {#/{totalCount} selected contact:} other {#/{totalCount} selected contacts:}}"
                        />
                      </span>
                      <Confirm
                        onConfirm={handleDeleteContacts}
                        title={
                          <Trans
                            id="contact-book.confirm-delete.title"
                            values={{ count }}
                            message="{count, plural, one {Delete contact} other {Delete contacts}}"
                          />
                        }
                        content={
                          <Trans
                            id="contact-book.confirm-delete.content"
                            values={{ count }}
                            message="{count, plural, one { The deletion is permanent, are you sure you want to delete this contact? } other { The deletion is permanent, are you sure you want to delete these contacts? }}"
                          />
                        }
                        render={(confirm) => (
                          <Button
                            className="s-contact-book-menu__action-btn"
                            display="inline"
                            noDecoration
                            icon={
                              isDeleting ? (
                                <Spinner
                                  svgTitleId="delete-contacts-spinner"
                                  isLoading
                                  display="inline"
                                />
                              ) : (
                                'trash'
                              )
                            }
                            onClick={confirm}
                            disabled={isDeleting}
                          >
                            <Trans
                              id="contact-book.action.delete"
                              message="Delete"
                            />
                          </Button>
                        )}
                      />
                      <Button
                        className="s-contact-book-menu__action-btn"
                        display="inline"
                        noDecoration
                        icon="tag"
                        onClick={handleOpenTags}
                      >
                        <Trans
                          id="contact-book.action.manage-tags"
                          message="Manage tags"
                        />
                      </Button>
                      {isTagModalOpen && (
                        <Modal
                          isOpen
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
                              values={{ nb: tagsInCommon.length }}
                              components={[
                                <span className="m-tags-form__count" />,
                              ]}
                            />
                          }
                          onClose={handleCloseTags}
                        >
                          {tagNamesInCommon.length > 1 && (
                            <Trans
                              id="tags.common_tags_applied"
                              message="Common tags applied to the current selection:"
                            />
                          )}

                          <TagsForm
                            initialTags={tagsInCommon}
                            onSubmit={handleTagsChange}
                          />
                        </Modal>
                      )}
                      {/* <Button
                            className="s-contact-book-menu__action-btn"
                            display="inline"
                            noDecoration
                            icon="share"
                            >
                            <Trans id="contact-book.action.start-discussion" message="Start discussion" />
                          </Button> */}
                    </>
                  )}
                  <div
                    className={classnames('s-contact-book-menu__select-all', {
                      's-contact-book-menu__select-all--label-hidden':
                        count > 0,
                    })}
                  >
                    <Checkbox
                      checked={count > 0 && count === totalCount}
                      indeterminate={count > 0 && count < totalCount}
                      onChange={handleSelectAllEntitiesChange}
                      label={
                        <Trans
                          id="contact-book.action.select-all"
                          message="Select all contacts"
                        />
                      }
                      showLabelforSr={count > 0}
                    />
                  </div>
                </div>
              }
            />
          </ActionBarWrapper>
        )}
      />
      <SidebarLayout
        sidebar={
          <div className="s-contact-book__sidebar">
            <div>
              <h2 className="s-contact-book__tags-title">
                <Trans id="contact-book.contacts.title" message="Contacts" />
              </h2>
              <NavList dir="vertical">
                <NavItem>
                  <Link
                    className="s-contact-book__action-button"
                    button
                    icon="plus"
                    shape="plain"
                    display="block"
                    to="/new-contact"
                  >
                    <Trans id="contact-book.action.add" message="Add" />
                  </Link>
                </NavItem>
                <NavItem>
                  <ImportContactButton
                    className="s-contact-book__action-button"
                    onUploadSuccess={handleUploadSuccess}
                  />
                </NavItem>
              </NavList>
            </div>
            <div>
              <h2 className="s-contact-book__tags-title">
                <Trans id="contact-book.groups.title" message="Groups" />
              </h2>
              <TagList />
              <NavList dir="vertical">
                <NavItem>
                  <Link
                    className="s-contact-book__action-button"
                    button
                    icon="tag"
                    shape="plain"
                    display="block"
                    to="/settings/tags"
                  >
                    <Trans
                      id="contact-book.tags.action.edit-groups"
                      message="Edit groups"
                    />
                  </Link>
                </NavItem>
              </NavList>
            </div>
          </div>
        }
      >
        <ContactList
          mode="contact-book"
          sortDir={sortDir}
          onSelectEntity={onSelectEntity}
          selectedContactsIds={selectedEntitiesIds}
          contacts={contacts}
        />
      </SidebarLayout>
    </div>
  );
}

export default withScrollManager()(ContactBook);
