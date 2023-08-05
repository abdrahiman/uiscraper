import React, { useEffect, useState } from "react";
import Nav from "./nav";
export default function Layout({ children }: { children: any }) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
