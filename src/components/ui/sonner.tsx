import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-foreground/75",
          success:
            "group-[.toaster]:border-emerald-400/35 group-[.toaster]:bg-emerald-500/14 group-[.toaster]:text-emerald-100",
          info:
            "group-[.toaster]:border-sky-400/35 group-[.toaster]:bg-sky-500/14 group-[.toaster]:text-sky-100",
          warning:
            "group-[.toaster]:border-amber-400/35 group-[.toaster]:bg-amber-500/14 group-[.toaster]:text-amber-100",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
