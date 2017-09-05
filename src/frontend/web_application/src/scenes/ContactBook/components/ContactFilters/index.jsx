import React from 'react';
import PropTypes from 'prop-types';
import { FormGrid, FormRow, FormColumn, SelectFieldGroup } from '../../../../components/form';
import { SORT_VIEW_FAMILY_NAME, SORT_VIEW_GIVEN_NAME } from '../../../ContactBook/presenter';

import './style.scss';

const ContactFilters = ({ onSortDirChange, onSortViewChange, sortView, sortDir, __ }) => (
  <FormGrid>
    <FormRow className="m-contacts-filters">
      <FormColumn size="shrink">
        <div className="m-contacts-filters__item">
          <label htmlFor="format-view" className="m-contacts-filters__label">
            {__('contacts-filters.format-view.label')}
          </label>
          <SelectFieldGroup
            name="format-view"
            className="m-contacts-filters__select"
            label={__('contacts-filters.format-view.label')}
            value={sortView}
            options={[
              { value: SORT_VIEW_GIVEN_NAME, label: __('contacts-filters.format-view.firstname') },
              { value: SORT_VIEW_FAMILY_NAME, label: __('contacts-filters.format-view.name') },
            ]}
            onChange={onSortViewChange}
            showLabelforSr
            expanded
          />
        </div>
      </FormColumn>
      <FormColumn size="shrink">
        <div className="m-contacts-filters__item">
          <label htmlFor="order-by" className="m-contacts-filters__label">
            {__('contacts-filters.order-by.label')}
          </label>
          <SelectFieldGroup
            className="m-contacts-filters__select"
            name="order-by"
            label={__('contacts-filters.order-by.label')}
            value={sortDir}
            options={[{ value: 'ASC', label: 'A -> Z' }, { value: 'DESC', label: 'Z -> A' }]}
            onChange={onSortDirChange}
            showLabelforSr
            expanded
          />
        </div>
      </FormColumn>
    </FormRow>
  </FormGrid>
);

ContactFilters.propTypes = {
  onSortDirChange: PropTypes.func.isRequired,
  onSortViewChange: PropTypes.func.isRequired,
  __: PropTypes.func.isRequired,
  sortDir: PropTypes.oneOf(['ASC', 'DESC']).isRequired,
  sortView: PropTypes.string.isRequired,
};

export default ContactFilters;
