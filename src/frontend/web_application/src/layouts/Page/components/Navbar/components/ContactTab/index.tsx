import * as React from 'react';
import classnames from 'classnames';
import { useQuery } from 'react-query';
import { getContact } from 'src/modules/contact/query';
import { Icon } from 'src/components';
import { getTabUrl } from 'src/modules/tab';
import Tab from '../Tab';
import NavbarItem from '../NavbarItem';
import ItemLink from '../ItemLink';
import ItemButton from '../ItemButton';

type Props = React.ComponentProps<typeof Tab>;

function ContactTab({
  className,
  isActive,
  tab,
  routeConfig,
  onRemove,
}: Props): React.ReactElement<typeof NavbarItem> {
  const { contactId } = tab.getMatch({ routeConfig }).params;
  const { data: contact } = useQuery(['contact', contactId], () =>
    getContact(contactId)
  );

  const label = routeConfig.tab.renderLabel({ contact });

  return (
    <NavbarItem
      className={classnames('m-tab', className)}
      active={isActive}
      contentChildren={
        <ItemLink
          to={getTabUrl(tab.location)}
          title={label}
          className="m-tab__content"
        >
          <Icon type="address-book" className="m-tab__icon" rightSpaced />
          {label}
        </ItemLink>
      }
      actionChildren={
        <ItemButton
          onClick={() => {
            onRemove({ tab });
          }}
          icon="remove"
          className="m-tab__action"
        />
      }
    />
  );
}

export default ContactTab;
