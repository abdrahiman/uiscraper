'use client';
import { BiCopy } from "react-icons/bi";
import { ISelector } from "./Selector";
import { VscJson } from "react-icons/vsc";
import JsonFormatter from "react-json-formatter";
import { JsonIcon } from "./custom/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react";
import { FileIcon } from "@radix-ui/react-icons";

interface CodeProps {
    selectors: ISelector[];
    data: string | null;
    urls: string;
}

export default function Code({selectors,data,urls,}:CodeProps) {
  let DownloadAsJson = () => {
    // create file in browser
    const fileName = "scraped_data";
    const blob = new Blob([data as BlobPart], { type: "application/json" });
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

  const [select , setSelect] = useState("")

  const handleSelect = (e: any) => {
    setSelect(e)
  }
  let handleCopy = (e: any) => {
    let Btn = e.target as HTMLElement;
    if (data) {
      navigator.clipboard.writeText(data || "");
      Btn.classList.add("copied");
      setTimeout(() => Btn.classList.remove("copied"), 3000);
    }
  };
  const jsonStyle = {
    propertyStyle: { color: "darkorange" },
    stringStyle: { color: "green" },
    booleanStyle: { color: "blue" },
    numberStyle: { color: "darkred" },
  };

  // lets make a function save the data as a file based on the selected format 

  const saveAs = (data: string, format: string) => {
    // create file in browser
    const fileName = "scraped_data";
    const blob = new Blob([data as BlobPart], { type: `application/${format}` });
    const href = URL.createObjectURL(blob);

    // create "a" HTML element with href to file
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + `.${format}`;
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    }
    // lets make a function to save the data as a file based on the selected format

    useEffect(() => {
        if(select === "json"){
            saveAs(data as string, "json")
        }
        if(select === "text"){
            saveAs(data as string, "text")
        }
        if(select === "csv"){
            saveAs(data as string, "csv")
        }
        }, [select])
  return (
    <>
      <div className="code">
        {data ? (
          <div className="data p-2 max-h-[40vh] text-sm overflow-auto">
            <button onClick={handleCopy}>
              <BiCopy />
            </button>
            <JsonFormatter json={data} jsonStyle={jsonStyle} tabWith={4} />
          </div>
        ) : data == null ? (
          <div
            role="status"
            className="w-full h-full flex justify-center items-center p-4"
          >
            <JsonIcon/>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="w-52">
      <Select
      onValueChange={handleSelect}
    >
        <SelectTrigger
        className="flex items-center "
        >
            
              <div className="flex justify-center items-center gap-2 text-green-400">
              <FileIcon/>
              {select === "" ? "Download As" : select}
              </div>
           
        </SelectTrigger>
        <SelectContent>
            <SelectItem
            value="json"
            >Json</SelectItem>
            <SelectItem
            value="text"
            >Text</SelectItem>
            <SelectItem
            value="csv"
            >CSV</SelectItem>
        </SelectContent>
    </Select>
      </div>
      {selectors.length !== 0 && (
        <div className="api w-full">
          <h3>Api Request</h3>
          <div className="code p-2">
            <button className="" onClick={handleCopy}>
              <BiCopy />
            </button>
            <pre className="data w-full overflow-auto">
              <code>
                {`let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
};

let bodyContent = ${JSON.stringify({
                  template: selectors,
                  urls: urls.split(",").map((e: string) => e.trim()),
                })}

let response = await fetch("https://uiscraper.vercel.app/api/scrape", {
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
    </>
  );
}
