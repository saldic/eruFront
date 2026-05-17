import eruSymbol from "../../assets/eru-symbol.png";

function Header({ currentUser, onLogout }) {
  const displayName = currentUser.username || currentUser.email;

  return (
    <header className="app-nav">
      <img src={eruSymbol} alt="eru" className="nav-symbol" />
      <div className="signed-in-controls">
        <button type="button" onClick={() => onLogout()}>
          Logout
        </button>
        <span>{displayName}</span>
      </div>
    </header>
  );
}

export default Header;
