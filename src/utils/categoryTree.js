/**
 * Build a nested category tree (unlimited depth) from a flat category list.
 * Each category links to its parent via `parent` (idCategory of the parent, 0 = root).
 * Categories whose `parent` is missing/undefined or points to an absent id are
 * treated as roots so none are dropped.
 * @param {Array<{idCategory:number, parent:number}>} categories - flat list
 * @returns {Array} nested tree where each node may carry a `children` array
 */
export function buildCategoryTree(categories = []) {
  const ids = new Set(categories.map((category) => category.idCategory));
  const childrenByParent = new Map();

  for (const category of categories) {
    const parentKey = ids.has(category.parent) ? category.parent : 0;
    if (!childrenByParent.has(parentKey)) childrenByParent.set(parentKey, []);
    childrenByParent.get(parentKey).push(category);
  }

  // WHY: `seen` guards against accidental cycles in the parent chain (infinite recursion).
  const attach = (parentKey, seen) =>
    (childrenByParent.get(parentKey) || [])
      .filter((category) => !seen.has(category.idCategory))
      .map((category) => {
        const nextSeen = new Set(seen).add(category.idCategory);
        const children = attach(category.idCategory, nextSeen);
        return children.length ? { ...category, children } : { ...category };
      });

  return attach(0, new Set());
}
