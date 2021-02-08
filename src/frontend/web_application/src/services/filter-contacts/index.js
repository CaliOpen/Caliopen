export default ({ contacts, searchTerms }) =>
  contacts.filter((contact) => {
    const match = ({ item, props }) =>
      props.find(
        (propName) =>
          item[propName] &&
          item[propName].toLowerCase().includes(searchTerms.toLowerCase())
      );

    const searchContactProps = [
      'title',
      'additional_name',
      'family_name',
      'given_name',
      'title',
    ];

    if (match({ item: contact, props: searchContactProps })) {
      return true;
    }

    if (
      contact.identities &&
      contact.identities.find((ident) =>
        match({ item: ident, props: ['infos', 'name', 'identity_id'] })
      )
    ) {
      return true;
    }

    if (
      contact.emails &&
      contact.emails.find((ident) => match({ item: ident, props: ['address'] }))
    ) {
      return true;
    }

    if (
      contact.ims &&
      contact.ims.find((ident) => match({ item: ident, props: ['address'] }))
    ) {
      return true;
    }

    if (
      contact.phones &&
      contact.phones.find((ident) => match({ item: ident, props: ['number'] }))
    ) {
      return true;
    }

    if (
      contact.tags &&
      contact.tags.find((ident) => match({ item: ident, props: ['name'] }))
    ) {
      return true;
    }

    return false;
  });
