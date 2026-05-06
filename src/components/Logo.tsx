interface Props {
  showName?: boolean;
  className?: string;
}

export const Logo = ({ showName = true, className = '' }: Props) =>
  showName ? (
    <div className={`w-full flex flex-col items-center justify-center text-center leading-none ${className}`}>
      <div className="font-display text-lg font-black tracking-wider neon-text">JOGA JUNTO</div>
      <div className="font-display text-xs font-bold tracking-[0.4em] text-neon-cyan">— 360 —</div>
    </div>
  ) : null;
