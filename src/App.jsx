import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router";
import eruApi from "./eruApi.js";
import ToastContainer from "./components/feedback/ToastContainer.jsx";
import SplashScreen from "./components/layout/SplashScreen.jsx";
import "./styles.css";

function App() {
  const [token, setToken] = useState(eruApi.getToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(eruApi.loggedIn());
  const [error, setErrorState] = useState("");
  const [toasts, setToasts] = useState([]);
  const [splashDone, setSplashDone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);

  const addToast = useCallback((text, type) => {
    if (!text) {
      return;
    }

    setToasts((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random()}`, text, type },
    ]);
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const setMessage = useCallback((nextMessage) => {
    addToast(nextMessage, "success");
  }, [addToast]);

  const setError = useCallback((nextError) => {
    setErrorState(nextError);
    addToast(nextError, "error");
  }, [addToast]);

  useEffect(() => {
    const fadeTimerId = window.setTimeout(() => {
      setSplashFading(true);
    }, 1400);
    const doneTimerId = window.setTimeout(() => {
      setSplashDone(true);
    }, 2400);

    return () => {
      window.clearTimeout(fadeTimerId);
      window.clearTimeout(doneTimerId);
    };
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
    return <SplashScreen fading={splashFading && !authChecking} />;
  }

  return (
    <>
      <Outlet
        context={{
          currentUser,
          error,
          handleLogin,
          handleLogout,
          handleRegister,
          setError,
          setMessage,
        }}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default App;
