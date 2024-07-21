"use client";
import React from "react";
import { WorkspaceProvider } from "@/lib/workspaces";

function Providers({
  children,
}: {
  children: any;
  customMeta?: {};
  className?: string;
}) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
export default Providers;
