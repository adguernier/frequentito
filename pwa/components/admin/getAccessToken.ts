"use client";

export const getAccessToken = () => {
  return localStorage.getItem("token");
};
