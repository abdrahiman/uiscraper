import React from "react";
import BLOG from "../BLOG.config";

function Container({
  children,
  customMeta,
  className,
}: {
  children: any;
  customMeta?: {};
  className?: string;
}) {
  const meta = {
    title: BLOG.title,
    type: "website",
    ...customMeta,
  };
  return (
    <>
      <main
        className={`flex-grow w-full transition-all flex h-full justify-start flex-col items-center px-4 max-w-7xl mx-auto
         ${!className ? "" : className}`}
      >
        {children}
      </main>
    </>
  );
}
export default Container;
