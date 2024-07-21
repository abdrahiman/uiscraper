"use client";
import { BiCopy } from "react-icons/bi";
import { ISelector } from "./Selector";
import JsonFormatter from "react-json-formatter";
import { JsonIcon } from "./custom/icons";
import CsvDownloadButton from "react-json-to-csv";

interface CodeProps {
  selectors: ISelector[];
  data: string | null;
  isLoading: boolean;
  urls: string;
}

export default function Code({ selectors, data, isLoading, urls }: CodeProps) {
  const handleSelect = (e: any) => {
    let select = e.target.value;
    console.log(select);
    if (select === "json") {
      saveAs(data as string, "json");
    }
    if (select === "txt") {
      saveAs(data as string, "txt");
    }
    if (select === "csv") {
      saveAs(data as string, "csv");
    }
  };
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
    if (format == "csv") {
      console.log(JSON.parse(data));
      let btn: HTMLElement | null = document.querySelector("#download_as_csv");
      if (btn) {
        btn.click();
      }
      return;
    }
    // create file in browser
    const fileName = "scraped_data";
    const blob = new Blob([data as BlobPart], {
      type: `application/${format}`,
    });
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
  };

  return (
    <>
      <CsvDownloadButton
        data={JSON.parse(data || "{}")}
        id="download_as_csv"
        filename="scraped_data"
        className="opacity-0 pointer-events-none h-0 w-0"
      />
      <div className="code">
        {!isLoading ? (
          <div className="data p-2 max-h-[40vh] text-sm overflow-auto">
            <button onClick={handleCopy}>
              <BiCopy />
            </button>
            <JsonFormatter
              json={data || "{}"}
              jsonStyle={jsonStyle}
              tabWith={4}
            />
          </div>
        ) : (
          <div
            role="status"
            className="w-full h-full flex justify-center items-center p-4"
          >
            <JsonIcon />
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </div>
      <div className="w-52">
        <select
          defaultValue={""}
          onInput={handleSelect}
          className="flex items-center bg-amber-400 outline-none px-12 py-2 rounded-md text-black"
        >
          <option value="" hidden className="bg-white border-none py-4">
            Download As
          </option>
          <option value="csv" className="bg-white border-none py-4 shadow-none">
            Csv
          </option>

          <option value="txt" className="bg-white border-none py-4">
            Text
          </option>
          <option value="json" className="bg-white border-none py-4">
            Json
          </option>
        </select>
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
