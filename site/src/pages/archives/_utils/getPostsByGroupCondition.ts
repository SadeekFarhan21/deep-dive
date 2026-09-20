import type { CollectionEntry } from "astro:content";

type GroupKey = string | number | symbol;
type GroupFunction<T> = (item: T, index?: number) => GroupKey;

export function getPostsByGroupCondition<T extends CollectionEntry<"posts">>(
  posts: T[],
  groupFunction: GroupFunction<T>
) {
  const result: Record<GroupKey, T[]> = {};

  for (let i = 0; i < posts.length; i++) {
    const item = posts[i];
    const groupKey = groupFunction(item, i);

    if (!result[groupKey]) {
      result[groupKey] = [];
    }

    result[groupKey].push(item);
  }

  return result;
}
