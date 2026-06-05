import { Link } from "react-router";

function BackLink({ children, to }) {
  return (
    <Link className="back-link" to={to}>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M15 6 9 12l6 6" />
        <path d="M10 12h10" />
      </svg>
      <span>{children}</span>
    </Link>
  );
}

export default BackLink;
