import * as React from 'react';
import PlaceholderBlock from '../PlaceholderBlock';
import './index.scss';

const renderDefault = () => (
  <PlaceholderBlock className="m-placeholder-list__item" />
);
interface Props {
  count?: number;
  title: string;
  renderItem: () => React.ReactNode;
}
export default function PlaceholderList({
  count = 5,
  title,
  renderItem = renderDefault,
}: Props) {
  const items: number[] = [];
  for (let i = 0; i < count; i++) {
    items.push(i);
  }

  return (
    <ul title={title} aria-busy>
      {items.map((n) => (
        <div key={n}>{renderItem()}</div>
      ))}
    </ul>
  );
}
