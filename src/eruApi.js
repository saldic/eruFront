const DEFAULT_BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : "https://eru-api.dk/api/v1";
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL)
  .replace(/\/$/, "");
const TOKEN_KEY = "eruToken";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function decodeTokenPayload() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const payloadBase64 = token.split(".")[1];
    const normalizedPayload = payloadBase64.replaceAll("-", "+").replaceAll("_", "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
}

function isTokenExpired() {
  const payload = decodeTokenPayload();

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

function loggedIn() {
  if (!getToken()) {
    return false;
  }

  if (isTokenExpired()) {
    logout();
    return false;
  }

  return true;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

function makeRequestOptions(method, addToken, body) {
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
  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    return handleHttpErrors(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Could not reach the ERU API. Check your connection and API URL.");
    }

    throw error;
  }
}

function getUserRoles() {
  return decodeTokenPayload()?.roles || [];
}

function login(credentials) {
  return request("/auth/login", makeRequestOptions("POST", false, credentials))
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
  return request("/auth/register", makeRequestOptions("POST", false, account))
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
  return request("/auth/me", makeRequestOptions("GET", true));
}

function getFeed(type) {
  const params = new URLSearchParams();

  if (type && type !== "ALL") {
    params.set("type", type);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/content/feed${query}`, makeRequestOptions("GET", true));
}

function getContent(type, activeOnly = true) {
  const params = new URLSearchParams({ activeOnly: String(activeOnly) });

  if (type && type !== "ALL") {
    params.set("type", type);
  }

  return request(`/content?${params.toString()}`, makeRequestOptions("GET", false));
}

function getContentById(contentId) {
  return request(`/content/${contentId}`, makeRequestOptions("GET", false));
}

function getMyInteractions(reactionType) {
  const query = reactionType ? `?reactionType=${reactionType}` : "";
  return request(`/interactions/me${query}`, makeRequestOptions("GET", true));
}

function saveInteraction(contentId, reactionType) {
  return request(
    `/content/${contentId}/interactions`,
    makeRequestOptions("POST", true, { reactionType }),
  );
}

function removeInteraction(contentId, reactionType) {
  const query = new URLSearchParams({ reactionType });
  return request(
    `/content/${contentId}/interactions?${query.toString()}`,
    makeRequestOptions("DELETE", true),
  );
}

function elaborateContent(contentId) {
  return request(`/content/${contentId}/elaborate`, makeRequestOptions("POST", true));
}

function createContent(content) {
  return request("/content", makeRequestOptions("POST", true, content));
}

function updateContent(contentId, content) {
  return request(
    `/content/${contentId}`,
    makeRequestOptions("PUT", true, content),
  );
}

function deleteContent(contentId) {
  return request(`/content/${contentId}`, makeRequestOptions("DELETE", true));
}

export default {
  createContent,
  deleteContent,
  elaborateContent,
  getContent,
  getContentById,
  getCurrentUser,
  getFeed,
  getMyInteractions,
  getToken,
  isTokenExpired,
  loggedIn,
  login,
  logout,
  register,
  removeInteraction,
  saveInteraction,
  updateContent,
};
