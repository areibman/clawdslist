import type { Category } from "@clawdslist/shared";

interface CategoryPillProps {
  category: Category;
}

export const CategoryPill = ({ category }: CategoryPillProps) => {
  return (
    <div className="category-pill">
      <span>{category.name}</span>
      <small>{category.description}</small>
    </div>
  );
};
