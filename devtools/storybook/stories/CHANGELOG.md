# Storybook Changelog

## [Unreleased]

### Added

  - DropdownMenu
  - MultidimensionalPi
  - IconLetter simple refactor of ContactIconLetter
  - Layout - TabList Presenter
  - ImportContactForm 

### Changed

  - Separate presentation from logic of Dropdown by adding DropdownMenu
  - remove styles from foundation's dropdown & use own styles

### Removed

  - DropdownController from Dropdown wich has been replaced by withDropdownControl HoC

## [2017-02-27]

### Added

  - Settings - DevicesManagement
  - Dropdown
  - Pi - PiBar
  - Layout - Section
  - Lists - DefList
  - form - CollectionFieldGroup

### Changed

  - Form - Field with error: no more uppercase for the message & replace background color by a red border (inset)
  - Button - Add "inline" prop, to be used for Button placed beside inputs (dark background, 1px left margin, small font)
  - Badge - remove no-radius, added radiusType [no|normal|rounded] "rounded" is not default anymore
  - Config - change radius size to .2rem (previous .125rem)

### Removed

  - BlockList - background color and ItemContent have been removed

## [2017-01-19]

### Added

  - Icons & &Avatars - Brand
  - Titles - Title
  - Form - PasswordStrength, CheckboxFieldGroup
  - Auth - AuthPage, SignupForm

### Changed

  - Switch has been moved into CheckboxFieldGroup
  - input, select have been re-designed following UI specs

## [2017-01-01]

### Added

  - Badge
  - Lists - BlockList, TextList
  - Button & Link
  - Icons & &Avatars - ContactAvatarLetter, Icon, Spinner
  - Titles - Subtitle
  - Form - Fieldset, FormGrid, TextFieldGroup, SelectFieldGroup, RadioFieldGroup, Switch
  - Contact - ContactDetails
