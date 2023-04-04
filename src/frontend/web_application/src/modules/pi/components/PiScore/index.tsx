import { useLingui } from '@lingui/react';
import * as React from 'react';
import { PI } from 'src/modules/pi/types';
import { computeScoreLetter } from '../../services/pi';
import svgSrc from './PI-score.svg';

const colors = 'E0D699,C1EDFE,AFD9EF,9CC7DC,7198A7';

interface Props extends React.HTMLAttributes<HTMLEmbedElement> {
  average: number;
  title?: string;
}

export default function PiScore({ title, average, ...props }: Props) {
  const { i18n } = useLingui();

  const score = computeScoreLetter(average);

  return (
    <embed
      src={`${svgSrc}?score=${score}&colors=${colors}`}
      title={
        title ||
        i18n._(
          'pi-score.default-title',
          { score },
          { message: 'This is scored as {score}.' }
        )
      }
      {...props}
    />
  );
}
