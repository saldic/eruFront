const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const TOKEN_KEY = "eruToken";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function loggedIn() {
  return getToken() !== null;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

function makeOptions(method, addToken, body) {
  const options = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  if (addToken && loggedIn()) {
    options.headers.Authorization = `Bearer ${getToken()}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
}

async function handleHttpErrors(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || text || "The API request failed.");
  }

  return data;
}

async function request(path, options) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  return handleHttpErrors(response);
}

function getUserRoles() {
  const token = getToken();

  if (token === null) {
    return [];
  }

  const payloadBase64 = token.split(".")[1];
  const normalizedPayload = payloadBase64.replaceAll("-", "+").replaceAll("_", "/");
  const paddedPayload = normalizedPayload.padEnd(
    Math.ceil(normalizedPayload.length / 4) * 4,
    "=",
  );
  const payload = JSON.parse(window.atob(paddedPayload));

  return payload.roles || [];
}

function hasUserAccess(neededRole, isLoggedIn) {
  return isLoggedIn && getUserRoles().includes(neededRole);
}

function login(credentials) {
  return request("/auth/login", makeOptions("POST", false, credentials))
    .then((response) => {
      setToken(response.token);
      return {
        id: response.userId,
        username: response.username,
        roles: getUserRoles(),
      };
    });
}

function register(account) {
  return request("/auth/register", makeOptions("POST", false, account))
    .then((response) => {
      setToken(response.token);
      return {
        id: response.userId,
        username: response.username,
        roles: getUserRoles(),
      };
    });
}

function getCurrentUser() {
  return request("/auth/me", makeOptions("GET", true));
}

function getFeed(type) {
  const params = new URLSearchParams();

  if (type && type !== "ALL") {
    params.set("type", type);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/content/feed${query}`, makeOptions("GET", true));
}

function getContent(type) {
  const params = new URLSearchParams({ activeOnly: "true" });

  if (type && type !== "ALL") {
    params.set("type", type);
  }

  return request(`/content?${params.toString()}`, makeOptions("GET", false));
}

function getMyInteractions(reactionType) {
  const query = reactionType ? `?reactionType=${reactionType}` : "";
  return request(`/interactions/me${query}`, makeOptions("GET", true));
}

function saveInteraction(contentId, reactionType) {
  return request(
    `/content/${contentId}/interactions`,
    makeOptions("POST", true, { reactionType }),
  );
}

function elaborateContent(contentId) {
  return request(`/content/${contentId}/elaborate`, makeOptions("POST", true));
}

export default {
  elaborateContent,
  getContent,
  getCurrentUser,
  getFeed,
  getMyInteractions,
  getToken,
  getUserRoles,
  hasUserAccess,
  loggedIn,
  login,
  logout,
  makeOptions,
  register,
  saveInteraction,
};
