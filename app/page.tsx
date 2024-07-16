"use client";
import React, { useEffect, useState } from "react";
import Container from "./components/Container";
import Selector, { ISelector } from "./components/Selector";
import { VscDebugStart } from "react-icons/vsc";
import { FiPlus, FiTrash } from "react-icons/fi";
import Code from "./components/code";

export default function Index() {
  let [data, setData] = useState<string | null>("");
  let [urls, setUrls] = useState("");

  let [selectors, setSelectors] = useState<ISelector[]>([]);
  let [localIsLoaded, setlocalIsLoaded] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("template") != null) {
      let data = JSON.parse(localStorage.getItem("template") as string);
      setSelectors(data.selectors);
      setUrls(data.urls);
    }
    setlocalIsLoaded(true);
  }, []);
  useEffect(() => {
    if (localIsLoaded) {
      let data = JSON.stringify({ urls, selectors });
      localStorage.setItem("template", data);
    }
  }, [selectors, setSelectors, urls, setUrls]);

  let scrapeWebsite = async () => {
    if (!urls || !urls.split(",") || !selectors) return;
    setData(null);
    let headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    let bodyContent = JSON.stringify({
      template: selectors,
      urls: urls.split(",").map((e: string) => e.trim()),
    });

    let response = await fetch("/api/scrape", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });
    let data = await response.json();

    setData(JSON.stringify(data));
  };

  let handleAdd = () => {
    let temp = selectors;
    temp.push({
      name: "",
      attr: "",
      selector: "",
      isArray: false,
      children: [],
      id: Date.now(),
    });
    setSelectors([...temp]);
  };

  return (
    <Container>
      <div className="w-full gap-6 flex flex-row pt-2 max-md:flex-col">
        <section className="w-full create flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <label htmlFor="">Schema</label>
            <div className="flex flex-row items-center gap-2">
              <button
                className="p-2 text-sm mt-4 w-fit rounded-lg bg-[#f0f0f0]"
                onClick={handleAdd}
                title="Add Selector"
              >
                <FiPlus />
              </button>
              <button
                title="Delete All !!"
                className="p-2 text-sm mt-4 w-fit rounded-lg bg-[#f0f0f0] hover:bg-red-600"
                onClick={() => setSelectors([])}
              >
                <FiTrash />
              </button>
            </div>
          </div>

          <div className="template flex flex-col gap-4 mt-4">
            {selectors.map((s) => (
              <Selector
                selectors={selectors}
                setSelectors={setSelectors}
                data={s}
              />
            ))}
          </div>
        </section>
        <section className="see">
          <div className="w-full flex flex-col gap-4 justify-between">
            <div className="urls w-full">
              <label htmlFor="">Urls</label>
              <textarea
                name=""
                id=""
                cols={30}
                rows={10}
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="https://www.exemple1.com,
                https://www.exemple3.com/movies?page={$i=>10}, https://www.exemple2.com/products?page={$i=2=>10},"
                className="p-2 outline-none solid border-2 border-gray-200 w-full "
              ></textarea>
              <button
                className={
                  data == null
                    ? "mt-4 opacity-50 capitalize"
                    : "mt-4 capitalize"
                }
                onClick={() => scrapeWebsite()}
              >
                <VscDebugStart size={16} />
                {data == null ? "stop" : "scrape"}
              </button>
            </div>
            <Code selectors={selectors} data={data} urls={urls} />
          </div>
        </section>
      </div>
    </Container>
  );
}
