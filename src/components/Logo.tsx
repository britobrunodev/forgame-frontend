interface Props {
  className?: string;
}

export const Logo = ({ className = '' }: Props) => (
  <img
    src="/forgame_logo.png"
    alt="Forgame"
    className={`h-10 w-auto object-contain ${className}`}
  />
);
