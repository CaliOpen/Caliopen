import intersection from 'lodash/intersection';
import { Entity } from '../types';

export const getTagNamesInCommon = (
  entities: Entity[],
  { strict = false } = {}
) =>
  intersection(
    ...(strict
      ? entities
      : entities
          // when not strict, this ignore entities with no tags, E.g I need to delete one tag in common
          // for a large selection which include entities with no tags
          .filter((entity) => entity.tags)
    ).map((entity) => entity.tags)
  );
