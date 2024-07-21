"use client";
import React, { useEffect, useState } from "react";
import Selector from "../components/Selector";
import { VscDebugStart } from "react-icons/vsc";
import { FiPlus, FiTrash } from "react-icons/fi";
import Code from "../components/code";
import { useWorkspace } from "@/lib/workspaces";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Index() {
  let [isLoading, setLoading] = useState(false);
  let { workspaces, setWorkspaces,isSideBarMax } = useWorkspace();
  let [workspaceId, setWorkspaceId] = useState(0);

  let params = useSearchParams();
  let router = useRouter();
  useEffect(() => {
    let id = parseInt(params.get("workspace") || "0");
    if (id >= workspaces.length || id < 0) {
      router.push("/");
      return;
    }
    setWorkspaceId(id);
  }, [params, router, workspaces]);

  let scrapeWebsite = async () => {
    if (
      !workspaces[workspaceId].urls ||
      !workspaces[workspaceId].urls.split(",") ||
      !workspaces[workspaceId].template
    )
      return;
    setLoading(true);
    let headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    let bodyContent = JSON.stringify({
      template: workspaces[workspaceId].template,
      urls: workspaces[workspaceId].urls
        .split(",")
        .map((e: string) => e.trim()),
    });

    let response = await fetch(
      `/api/${workspaces[workspaceId].isPuppetter ? "pptr" : "dom"}`,
      {
        method: "POST",
        body: bodyContent,
        headers: headersList,
      }
    );
    let data = await response.json();
    workspaces[workspaceId].data = JSON.stringify(data);
    setWorkspaces([...workspaces]);
    setLoading(false);
  };

  let handleAdd = () => {
    let worktemp = workspaces;
    worktemp[workspaceId].template.push({
      name: "",
      attr: "",
      selector: "",
      isArray: false,
      children: [],
      id: Date.now(),
    });
    setWorkspaces([...worktemp]);
  };

  if (!workspaces[workspaceId]) {
    return "Loading...";
  } else
    return (
      <main
        className={cn(
          "flex-grow mb-6 transition-all h-full justify-start flex w-full gap-6 flex-row pt-4 max-md:flex-col items-start max-md:px-2 mx-auto px-4",isSideBarMax ?" pl-[265px]":" pl-[60px]"
        )}
      >
        <section className="w-full create flex flex-col h-full">
          <div className="flex flex-row justify-between items-center">
            <label htmlFor="">Schema </label>
            <div className="flex flex-row items-center gap-2">
              <button
                className="p-2 text-sm w-fit rounded-lg bg-[#f0f0f0]"
                onClick={handleAdd}
                title="Add Selector"
              >
                <FiPlus />
              </button>
              <button
                title="Delete All !!"
                className="p-2 text-sm w-fit rounded-lg bg-[#f0f0f0] hover:bg-red-600"
                onClick={() => {
                  let temp = workspaces;
                  temp[workspaceId].template = [];
                  setWorkspaces([...temp]);
                }}
              >
                <FiTrash />
              </button>
              <button
                title="Puppetter !!"
                className={`p-2 text-sm w-fit rounded-lg bg-[#f0f0f0] hover:bg-green-200 ${
                  workspaces[workspaceId].isPuppetter
                    ? " bg-green-500 text-white hover:bg-green-700"
                    : ""
                }`}
                onClick={() => {
                  workspaces[workspaceId].isPuppetter =
                    !workspaces[workspaceId].isPuppetter;
                  setWorkspaces([...workspaces]);
                }}
              >
                Puppetter
              </button>
            </div>
          </div>

          <div className="template flex flex-col gap-4 mt-4">
            {workspaces[workspaceId].template.map((s) => (
              <Selector
                key={s.id}
                selectors={workspaces[workspaceId].template}
                setSelectors={(v: any) => {
                  let temp = workspaces;
                  temp[workspaceId].template = v;
                  setWorkspaces([...temp]);
                }}
                data={s}
              />
            ))}
          </div>
        </section>
        <section className="see w-full">
          <div className="w-full flex flex-col gap-4 justify-between">
            <div className="urls w-full">
              <label htmlFor="">Urls</label>
              <textarea
                name=""
                id=""
                cols={30}
                rows={10}
                value={workspaces[workspaceId].urls}
                onChange={(e) => {
                  let temp = workspaces;
                  temp[workspaceId].urls = e.target.value;
                  setWorkspaces([...temp]);
                }}
                placeholder="https://www.exemple1.com,
                https://www.exemple3.com/movies?page={$i=>10}, https://www.exemple2.com/products?page={$i=2=>10},"
                className="p-2 outline-none solid border-2 border-gray-200 w-full "
              ></textarea>
              <button
                className={
                  isLoading ? "mt-4 opacity-50 capitalize" : "mt-4 capitalize"
                }
                onClick={() => scrapeWebsite()}
              >
                <VscDebugStart size={16} />
                {isLoading ? "stop" : "scrape"}
              </button>
            </div>
            <Code
              isLoading={isLoading}
              selectors={workspaces[workspaceId].template}
              data={workspaces[workspaceId].data}
              urls={workspaces[workspaceId].urls}
            />
          </div>
        </section>
      </main>
    );
}
