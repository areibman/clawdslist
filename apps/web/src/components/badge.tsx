interface BadgeProps {
  label: string;
  tone?: "default" | "accent" | "muted";
}

export const Badge = ({ label, tone = "default" }: BadgeProps) => {
  return <span className={`badge badge-${tone}`}>{label}</span>;
};
