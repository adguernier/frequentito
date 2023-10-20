"use client";

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
        console.debug("response", response);
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((auth) => {
        localStorage.setItem("token", JSON.stringify(auth));
      })
      .catch(() => {
        throw new Error("Network error");
      });
  },
  logout: () => {
    console.log("logout");
    localStorage.removeItem("username");
    return Promise.resolve();
  },
  checkAuth: () => {
    return localStorage.getItem("token") ? Promise.resolve() : Promise.reject();
  },
  checkError: (error) => {
    console.log("checkError");
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      return Promise.reject();
    }
    // other error code (404, 500, etc): no need to log out
    return Promise.resolve();
  },
  getIdentity: () => {
    console.log("getIdentity");
    return Promise.resolve({
      id: "user",
      fullName: "John Doe",
    });
  },
  getPermissions: () => Promise.resolve(""),
  handleCallback: () => Promise.resolve(/* ... */), // for third-party authentication only
};
