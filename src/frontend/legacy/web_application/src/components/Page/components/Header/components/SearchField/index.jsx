import React from 'react';
import './style.scss';
import InputText from '../../../../../InputText';
import Icon from '../../../../../Icon';
import { RawButton } from '../../../../../Button';

const SearchField = () => (
  <div className="m-search-field">
    <form>
      <InputText
        placeholder={'header.menu.search'}
        className="m-search-field__input m-input-text"
      />
      <RawButton
        className="m-search-field__button"
        type="submit"
        aria-label={'header.menu.search'}
      ><Icon type="search" /></RawButton>
    </form>
  </div>
);

export default SearchField;
