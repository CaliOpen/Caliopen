def import_vcard(username, directory, file_vcard, **kwargs):

    from caliopen_main.contact.parameters import NewContact

    from caliopen_main.contact.core import Contact as CoreContact
    from caliopen_main.user.core.user import User as CoreUser

    from caliopen_main.contact.parsers import parse_vcards
    from caliopen_main.contact.parsers import read_file, read_directory

    vcards = []

    if directory:
        vcards = read_directory(directory)

    if file_vcard:
        vcards = read_file(file_vcard, True)

    user = CoreUser.by_name(username)

    new_contacts = parse_vcards(vcards)

    for i in new_contacts:
        CoreContact.create(user, i)
