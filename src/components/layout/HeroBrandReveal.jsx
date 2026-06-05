import eruSymbol from "../../assets/eru-symbol.png";

function HeroBrandReveal() {
  return (
    <div className="hero-brand-reveal">
      <img src={eruSymbol} alt="eru" className="hero-logo" />
      <svg
        className="hero-word-reveal"
        viewBox="0 0 420 130"
        role="img"
        aria-label="eru"
      >
        <defs>
          <linearGradient id="eruWordGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="48%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6d2eb7" />
          </linearGradient>
        </defs>
        <path className="hero-reveal-line" d="M48 15 H372" />
        <text className="hero-reveal-text" x="210" y="104" textAnchor="middle">
          eru
        </text>
      </svg>
    </div>
  );
}

export default HeroBrandReveal;
