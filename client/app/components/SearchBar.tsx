import { useEffect, useState, type FormEvent } from "react";
import { SearchIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type Props = {
  className?: string;
  initialValue?: string;
  placeholder?: string;
};

export function SearchBar({
  className,
  initialValue = "",
  placeholder = "Search people, posts, hashtags",
}: Props) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = value.trim();

    if (!query) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={submitSearch} className={cn("relative w-full", className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Search across the app"
        className="pl-9 pr-16"
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      <Button
        type="submit"
        size="sm"
        className="absolute right-1 top-1/2 h-7 -translate-y-1/2 rounded-full"
      >
        Search
      </Button>
    </form>
  );
}
