import { useLingui } from '@lingui/react';
import * as React from 'react';
import classnames from 'classnames';
import Icon from '../Icon';
import './style.scss';

interface Props {
  strength: number;
  className?: string;
}
function PasswordStrength({ strength, className }: Props) {
  const { i18n } = useLingui();

  const feedbacks = {
    weak: i18n._(/* i18n */ 'password_strength.feedback.weak', undefined, {
      message: 'Strength: weak',
    }),
    moderate: i18n._(
      /* i18n */ 'password_strength.feedback.moderate',
      undefined,
      {
        message: 'Strength: moderate',
      }
    ),
    strong: i18n._(/* i18n */ 'password_strength.feedback.strong', undefined, {
      message: 'Strength: strong',
    }),
  };

  const classNameModifiers = {
    weak: 'm-password-strength--weak',
    moderate: 'm-password-strength--moderate',
    strong: 'm-password-strength--strong',
  };

  let key;
  switch (true) {
    default:
    case strength <= 1:
      key = 'weak';
      break;
    case strength >= 2 && strength <= 3:
      key = 'moderate';
      break;
    case strength >= 4:
      key = 'strong';
      break;
  }
  const passwordStrengthClassName = classnames(
    'm-password-strength',
    classNameModifiers[key],
    className
  );

  return (
    <div className={passwordStrengthClassName}>
      <div className="m-password-strength__graph">
        <Icon type="lock" className="m-password-strength__icon" />
        <div className="m-password-strength__guide">
          <div className="m-password-strength__bar" />
        </div>
        <span className="m-password-strength__text">{feedbacks[key]}</span>
      </div>
    </div>
  );
}

export default PasswordStrength;
