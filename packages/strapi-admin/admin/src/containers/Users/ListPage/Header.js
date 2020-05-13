import React from 'react';
import PropTypes from 'prop-types';
import { useGlobalContext } from 'strapi-helper-plugin';
import { Header as HeaderCompo } from '@buffetjs/custom';

const Header = ({ count, onClickAddUser }) => {
  const { formatMessage } = useGlobalContext();
  const tradBaseId = 'Settings.permissions.users.listview.';
  const headerDescriptionSuffix =
    count > 1 ? 'header.description.plural' : 'header.description.singular';
  const headerProps = {
    actions: [
      {
        color: 'delete',
        disabled: true,
        label: formatMessage({ id: 'app.utils.delete' }),
        type: 'button',
      },

      {
        color: 'primary',
        icon: true,
        label: formatMessage({ id: 'Settings.permissions.users.create' }),
        onClick: onClickAddUser,
        type: 'button',
      },
    ],
    content: formatMessage({ id: `${tradBaseId}${headerDescriptionSuffix}` }, { number: count }),
    title: { label: formatMessage({ id: `${tradBaseId}header.title` }) },
  };

  return <HeaderCompo {...headerProps} />;
};

Header.defaultProps = {
  count: 0,
  onClickAddUser: () => {},
};

Header.propTypes = {
  count: PropTypes.number,
  onClickAddUser: PropTypes.func,
};

export default Header;