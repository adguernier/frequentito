"use client";
import dynamic from "next/dynamic";

const Admin = dynamic(() => import("./AdminApp"), {
  ssr: false,
});

export default Admin;
