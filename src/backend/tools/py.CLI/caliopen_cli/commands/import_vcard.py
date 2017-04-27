import os
import vobject

def import_vcard(username, directory, file_vcard, **kwargs):

    from caliopen_main.user.parameters.contact import NewContact

    from caliopen_main.user.core.contact import Contact as CoreContact
    from caliopen_main.user.core.user import User as CoreUser

    from caliopen_main.parsers import parse_vcards

    vcards = []

    if directory:
        files = [f for f in os.listdir(directory) if
                     os.path.isfile(os.path.join(directory, f))]
        for f in files:
            ext = f.split('.')[-1]
            if ext == 'vcard' or ext == 'vcf':
                with open('{directory}/{file}'.
                          format(directory=directory, file=f), 'r') as fh:
                    vcards_tmp = vobject.readComponents(fh)

                    for v in vcards_tmp:
                        vcards.append(v)

    if file_vcard:
        ext = file_vcard.split('.')[-1]
        if ext == 'vcard' or ext == 'vcf':
            with open('{}'.format(file_vcard), 'r') as fh:
                 vcards_tmp = vobject.readComponents(fh)
                 for v in vcards_tmp:
                     vcards.append(v)

    user = CoreUser.by_name(username)

    new_contacts = parse_vcards(vcards)

    for i in new_contacts:
        CoreContact.create(user, i)
