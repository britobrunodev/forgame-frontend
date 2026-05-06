interface Props {
  showName?: boolean;
  className?: string;
}

export const Logo = ({ showName = true, className = '' }: Props) =>
  showName ? (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <img
        src="/forgame_logo.png"
        alt="Forgame"
        className="h-auto w-full max-w-[16rem] object-contain sm:max-w-[18rem]"
      />
    </div>
  ) : null;
