export default function CategoryPill({ category }) {
  return (
    <span className="chip" title={category.description}>
      {category.name} · {category.count}
    </span>
  );
}
