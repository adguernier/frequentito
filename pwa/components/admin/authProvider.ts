"use client";

import { getAccessToken } from "./getAccessToken";

export const authProvider = {
  login: ({ username, password }: { username: string; password: string }) => {
    const request = new Request(
      `${process.env.NEXT_PUBLIC_API_ENTRYPOINT ?? window.origin}/auth`,
      {
        method: "POST",
        body: JSON.stringify({ email: username, password }),
        headers: new Headers({ "Content-Type": "application/json" }),
      }
    );
    return fetch(request)
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((auth) => {
        localStorage.setItem("token", auth.token);
      })
      .catch(() => {
        throw new Error("Network error");
      });
  },
  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },
  checkAuth: () => {
    return getAccessToken() ? Promise.resolve() : Promise.reject();
  },
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      return Promise.reject();
    }
    // other error code (404, 500, etc): no need to log out
    return Promise.resolve();
  },
  getIdentity: () => {
    return Promise.resolve({
      id: "1",
      fullName: "Admin",
      avatar: "",
    });
  },
  getPermissions: () => Promise.resolve(""),
  handleCallback: () => Promise.resolve(/* ... */), // for third-party authentication only
};
