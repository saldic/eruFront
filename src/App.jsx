import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import eruApi from "./eruApi.js";
import SplashScreen from "./components/layout/SplashScreen.jsx";
import "./styles.css";

function App() {
  const [token, setToken] = useState(eruApi.getToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(eruApi.loggedIn());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setSplashDone(true);
    }, 1100);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      setAuthChecking(false);
      return;
    }

    let ignore = false;

    eruApi.getCurrentUser()
      .then((user) => {
        if (!ignore) {
          setCurrentUser({
            id: user.userId,
            username: user.username,
            roles: user.roles,
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          handleLogout("");
          setError("Your session expired. Log in again.");
        }
      })
      .finally(() => {
        if (!ignore) {
          setAuthChecking(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  function handleLogin(credentials) {
    return eruApi.login(credentials)
      .then((user) => {
        setToken(eruApi.getToken());
        setCurrentUser(user);
        setMessage(`Logged in as ${user.username}.`);
        setError("");
      });
  }

  function handleRegister(account) {
    return eruApi.register(account)
      .then((user) => {
        setToken(eruApi.getToken());
        setCurrentUser(user);
        setMessage(`Account created for ${user.username}.`);
        setError("");
      });
  }

  function handleLogout(nextMessage = "Logged out.") {
    eruApi.logout();
    setToken(null);
    setCurrentUser(null);
    setMessage(nextMessage);
    setError("");
  }

  if (!splashDone || authChecking) {
    return <SplashScreen />;
  }

  return (
    <Outlet
      context={{
        currentUser,
        error,
        handleLogin,
        handleLogout,
        handleRegister,
        message,
        setError,
        setMessage,
      }}
    />
  );
}

export default App;
