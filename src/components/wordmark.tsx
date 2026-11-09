import { APP_NAME_PARTS } from "@/lib/app-name";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  as?: "p" | "span" | "div" | "h1";
  className?: string;
};

// The name is written as is and uppercased by CSS, so screen readers read the name.
export function Wordmark({ as: Tag = "p", className }: WordmarkProps) {
  return (
    <Tag
      className={cn(
        "font-heading text-2xl leading-none font-extrabold tracking-wide italic uppercase md:text-3xl",
        className,
      )}
    >
      {APP_NAME_PARTS[0]}
      <span className="text-primary">{APP_NAME_PARTS[1]}</span>
    </Tag>
  );
}
