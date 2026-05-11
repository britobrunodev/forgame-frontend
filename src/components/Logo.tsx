interface Props {
  className?: string;
}

export const Logo = ({ className = 'h-10' }: Props) => (
  <img
    src="/forgame_logo.png"
    alt="Forgame"
    className={`w-auto object-contain ${className}`}
  />
);
