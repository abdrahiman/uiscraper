"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IoMdTrash } from "react-icons/io";
import { useWorkspace } from "@/lib/workspaces";
import { useState } from "react";
import { Logo } from "./custom/icons";
import { LuArrowLeftToLine, LuArrowRightToLine } from "react-icons/lu";

export default function WorkSpacesSideBar() {
  let p = useSearchParams();
  let {
    workspaces,
    setWorkspaces,
    setSideBar: setMax,
    isSideBarMax: isMax,
  } = useWorkspace();
  let [isHovered, setHovered] = useState(true);

  let addWorkSpace = () => {
    let temp = workspaces;
    temp.push({
      urls: "https://exemple.com",
      template: [],
      data: "",
      isPuppetter: false,
    });
    setWorkspaces([...temp]);
  };
  let removeWorkSpace = (i: number) => {
    let temp = workspaces.filter((e, idx) => idx != i);
    setWorkspaces([...temp]);
  };
  return (
    <>
      {isMax || isHovered ? (
        <aside
          className="max-w-[250px] fixed left-0 top-0 py-4 px-2 z-30 w-full bg-gray-100 h-screen flex-col gap-4"
          onMouseLeave={() => isHovered && setHovered(false)}
        >
          <div className="flex flex-row justify-between items-center">
            <div className="logo flex flex-row gap-2 items-center">
              <Link href="/">
                <div className="logo">
                  <Logo />
                </div>
              </Link>
              <div className="font-bold">
                <span className="text-amber-500">Ui</span>Scraper
              </div>
            </div>
            <button
              className="maxmin p-2 rounded-md hover:bg-[#ddd]"
              onClick={() => setMax(!isMax)}
            >
              {isMax ? <LuArrowLeftToLine /> : <LuArrowRightToLine />}
            </button>
          </div>
          <div className="workspacs flex flex-col gap-2 w-full mt-12">
            <button
              className="rounded-lg bg-orange-300 px-4 py-2 text-sm"
              onClick={addWorkSpace}
            >
              Create new workspace
            </button>
            <h3 className="mb-2">Workspaces</h3>
            {workspaces.map((workspace, i) => (
              <Link
                href={"/?workspace=" + i}
                key={i}
                className={`workspace py-2 px-2 w-full justify-between items-center rounded-lg flex flex-row ${
                  parseInt(p.get("workspace") || "0") == i
                    ? "bg-orange-400"
                    : ""
                }`}
              >
                <p className="text-ellipsis max-w-full text-nowrap overflow-hidden text-sm">
                  {workspace.urls.substring(0, 50)}
                </p>
                <div className="actions flex gap-4 ml-2 items-center">
                  <button
                    onClick={() => removeWorkSpace(i)}
                    className="bg-white p-1 rounded-lg hover:bg-red-500"
                  >
                    <IoMdTrash />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      ) : (
        <aside
          className="max-w-[50px] fixed left-0 top-0 py-4 px-2 w-full bg-gray-100 h-screen flex-col gap-4 items-center"
          onMouseEnter={() => setHovered(true)}
        >
          <div className="logo flex flex-row gap-2 items-center w-full">
            <Link href="/" className="w-full">
              <Logo />
            </Link>
          </div>
        </aside>
      )}
    </>
  );
}
