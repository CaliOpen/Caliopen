import * as React from 'react';
import { Trans, useLingui } from '@lingui/react';

interface Props {
  size: number;
}
function FileSize({ size }: Props): React.ReactElement<typeof Trans> {
  const { i18n } = useLingui();

  if (size / 100 < 1) {
    return <Trans id="file.size.B" message="{size} B" values={{ size }} />;
  }

  const renderNumber = (value) =>
    i18n.number(value, { maximumFractionDigits: 1 });

  if (size / 1000000 < 1) {
    return (
      <Trans
        id="file.size.kB"
        message="{size} kB"
        values={{
          size: renderNumber(Math.round(size / 10) / 100),
        }}
      />
    );
  }

  if (size / 1000000000 < 1) {
    return (
      <Trans
        id="file.size.mB"
        message="{size} mB"
        values={{
          size: renderNumber(Math.round(size / 10000) / 100),
        }}
      />
    );
  }

  if (size / 1000000000000 < 1) {
    return (
      <Trans
        id="file.size.gB"
        message="{size} gB"
        values={{
          size: renderNumber(Math.round(size / 10000000) / 100),
        }}
      />
    );
  }

  return (
    <Trans
      id="file.size.tB"
      message="{size} tB"
      values={{
        size: renderNumber(Math.round(size / 10000000000) / 100),
      }}
    />
  );
}

export default FileSize;
