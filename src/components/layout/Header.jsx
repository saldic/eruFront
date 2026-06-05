import { NavLink } from "react-router";
import BrandMark from "./BrandMark.jsx";

function FeedIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
      <path d="M9 12.5 11 14.5 15.5 10" />
    </svg>
  );
}

function InteractionsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m7 4 10 9-5 .8-2.5 4.7L7 4Z" />
      <path d="M15.5 4.5 17 3M18 8h2M11 3V1" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M10 5H5v14h5" />
      <path d="M13 8l4 4-4 4" />
      <path d="M8 12h9" />
    </svg>
  );
}

function Header({ currentUser, onLogout }) {
  const displayName = currentUser.username;
  const isAdmin = currentUser.roles?.includes("ADMIN");

  return (
    <header className="app-nav">
      <BrandMark />
      <div className="signed-in-controls">
        <NavLink
          aria-label="Feed"
          className="icon-nav-control"
          title="Feed"
          to="/feed"
        >
          <FeedIcon />
        </NavLink>
        <NavLink
          aria-label="Explore content"
          className="icon-nav-control"
          title="Explore content"
          to="/explore"
        >
          <ExploreIcon />
        </NavLink>
        <NavLink
          aria-label="Interactions"
          className="icon-nav-control"
          title="Interactions"
          to="/interactions"
        >
          <InteractionsIcon />
        </NavLink>
        {isAdmin ? (
          <NavLink
            aria-label="Admin"
            className="icon-nav-control"
            title="Admin"
            to="/admin"
          >
            <AdminIcon />
          </NavLink>
        ) : null}
        <button
          aria-label="Logout"
          className="icon-nav-control"
          title="Logout"
          type="button"
          onClick={() => onLogout()}
        >
          <LogoutIcon />
        </button>
        <span className="signed-in-user">{displayName}</span>
      </div>
    </header>
  );
}

export default Header;
