import React, { useEffect, useState, useContext } from "react";
import { createRoot } from "react-dom/client";
import Container from "../components/Container";
import Extatore from "../components/Extatore";
import { VscDebugStart, VscJson } from "react-icons/vsc";
import { BiCopy } from "react-icons/bi";
import { TupleType } from "typescript";
import { useRouter } from "next/router";

export default function Index() {
  let [data, setData] = useState<[] | boolean | null>(false);
  let [template, setTmp] = useState([]);
  let [urls, setUrls] = useState("");

  // get one child data
  let getChild = (child: any) => {
    if (!child) return;
    if (
      child.classList?.contains("group") ||
      child.firstChild?.classList.contains("group")
    ) {
      return getChildren(child);
    }
    let attr = child.querySelector("input.attr").value;
    let name: string = child.querySelector("input.name").value;
    let selctor = child.querySelector("input.selc").value;

    return {
      [name]: `${selctor}${attr ? " | attr:" + attr : ""}`,
    };
  };
  let r = useRouter();

  // if you want to get the the all the children from on group
  let getChildren = (children: any) => {
    if (!children) return;
    let firstElement: any = children.querySelector(".group > .extractor");
    let name: string = firstElement.querySelector("input.name").value;
    let selector = firstElement.querySelector("input.selc").value;
    let isArr = firstElement.querySelector("input.isarray").checked;
    let dataObjects: any = [];
    children
      .querySelectorAll(".group >.children > .child")
      .forEach((child: any) => {
        dataObjects.push(getChild(child));
      });
    let finalResulte: any = Object.assign({}, ...dataObjects, { $: selector });
    if (isArr) {
      finalResulte = [finalResulte];
    }
    return { [name]: finalResulte };
  };

  let processData = async () => {
    if (!urls) return;
    setData(null);
    let urlsv: string[] = urls.split(",").map((e: string) => e.trim());
    let template: any = [];
    document.querySelectorAll(".template > div").forEach((group: any) => {
      template.push(getChild(group));
    });
    if (template.length == 1) {
      template = { ...template[0] };
    }
    setTmp(template);
    let headersList = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    let bodyContent = JSON.stringify({
      template,
      urls: urlsv,
    });

    let response = await fetch("/api/scrape", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });
    let data: [] = await response.json();

    setData(data);
  };

  let handleAdd = () => {
    let root = document.querySelector(".template") as HTMLElement;
    let group = document.createElement("div");
    group.className = "child";
    root.append(group);
    createRoot(group).render(<Extatore />);
  };

  let DownloadAsJson = () => {
    // create file in browser
    const fileName = "scraped_data";
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    // create "a" HTML element with href to file
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  let handleCopy = (e: any) => {
    let Btn = e.target as HTMLElement;
    navigator.clipboard.writeText(
      Btn.parentElement?.querySelector("code")?.textContent || "lo"
    );
    Btn.classList.add("copied");
    setTimeout(() => Btn.classList.remove("copied"), 3000);
  };

  return (
    <Container>
      <div className="w-full gap-6 flex flex-row pt-4 max-md:flex-col">
        <section className="w-full create flex flex-col">
          <label htmlFor="">Schema</label>
          <div className="template flex flex-col gap-4">
            <div className="child">
              <Extatore />
            </div>
          </div>
          <button
            className="bg-blue-500 px-4 py-2 mt-4 rounded-lg"
            onClick={handleAdd}
          >
            Add
          </button>
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
                placeholder="https://www.exemple1.com, https://www.exemple2.com"
                className="p-2 outline-none solid border border-gray-200 w-full"
              ></textarea>
              <button
                className={
                  data == null ? "mt-4 opacity-50 pointer-event-none" : "mt-4"
                }
                onClick={() => processData()}
              >
                <VscDebugStart size={16} />
                scrape
              </button>
            </div>
            <div className="code">
              {data ? (
                <pre className="data">
                  <button onClick={handleCopy}>
                    <BiCopy />
                  </button>
                  <code>{JSON.stringify(data)}</code>
                </pre>
              ) : data == null ? (
                <div
                  role="status"
                  className="w-full h-full flex justify-center items-center"
                >
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-500"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                ""
              )}
            </div>
            <button
              onClick={DownloadAsJson}
              className={`json ${data ? "" : "opacity-30 pointer-events-none"}`}
            >
              <VscJson size={20} /> Download Json file
            </button>
            {template.length !== 0 && (
              <div className="api w-full">
                <h3>Api Request</h3>
                <div className="code">
                  <button className="" onClick={handleCopy}>
                    <BiCopy />
                  </button>
                  <pre className="data w-full">
                    <code>
                      {`
let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
};

let bodyContent = ${JSON.stringify({
                        template: template,
                        urls: urls.split(",").map((e: string) => e.trim()),
                      })}

let response = await fetch("https://perfrico.vercel.app/api/scrape", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  
  let data= await response.json();
  
  console.log(data)
  `}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Container>
  );
}
