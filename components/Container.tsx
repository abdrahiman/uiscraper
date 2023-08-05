import React from "react";

function Container({
  children,
  customMeta,
  className,
}: {
  children: any;
  customMeta?: {};
  className?: string;
}) {

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
