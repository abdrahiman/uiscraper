// import { load } from "cheerio";
import axios from "axios";
import { cheerioJsonMapper } from "cheerio-json-mapper";
import { NextApiRequest, NextApiResponse } from "next";

let getHtml = async (url: string) => {
  let res = null;
  try {
    res = await axios.get(url);
  } catch (err: any) {
    return new Error(err);
  }
  let html = res.data;
  return html;
};

let scrapeWebsite = async (url: string, template: {}) => {
  let html: string = "";
  try {
    let tmp: any = await getHtml(url);
    html = tmp;
  } catch (err) {
    return null;
  }
  let data = await cheerioJsonMapper(html, template);
  return data;
};

export default async function HANDLER(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method == "POST") {
      let { urls, template }: { urls: []; template: {} } = req.body;
      if (!urls || !template) {
        return res.status(401).send("data not valid");
      }
      if (!Array.isArray(urls) || typeof template != "object") {
        return res.status(401).send("data is not valid");
      }
      let data: {}[] = [];
      for (let i = 0; i < urls.length; i++) {
        let webdata: any = await scrapeWebsite(urls[i], template);
        data.push(webdata);
      }
      return res.status(200).json(data);
    } else {
      return res.status(403).send("this method is not allowed");
    }
  } catch (err: any) {
    return res.status(500).send(err.message);
  }
}

// My custom cherio tempate maker before founding cherioTemplateMapper lib
// let customScrap = (html: string, template) => {
//   const $ = load(html);
//   let data: any = {};
//   for (let [ki, vl] of Object.entries(template)) {
//     let res: any = null;
//     let v: {
//       isArray?: boolean;
//       attr?: string;
//       $?: string;
//       elements?: { name: string; value: string }[];
//       do?: (res: any) => void;
//     } = vl;
//     let k: string = ki;

//     if (typeof v == "string") {
//       res = $(v).text();
//     } else if (typeof v == "object") {
//       if (v.isArray) {
//         if (v.attr) {
//           let els = $(v.$);
//           let arr = [];
//           for (let i = 0; i < els.length; i++) {
//             arr.push(`${$(els[i]).attr(v.attr)}`);
//           }
//           res = arr;
//         } else if (v.elements) {
//           let els = $(v.$);
//           let arr = [];
//           for (let i = 0; i < els.length; i++) {
//             let term: any = {};

//             for (let j = 0; j < v.elements.length; j++) {
//               term[Object.keys(v.elements[j])[0]] = $(els[i])
//                 .find(Object.values(v.elements[j])[0])
//                 .text();
//             }
//             arr.push(term);
//           }
//           res = arr;
//         } else {
//           let els = $(v.$);
//           let arr: string[] = [];
//           for (let i = 0; i < els.length; i++) {
//             arr.push($(els[i]).text());
//           }
//           res = arr;
//         }
//       } else if (v.attr) {
//         res = $(v.$).attr(v.attr);
//       }
//     }
//     if (v.do && res) {
//       data[k] = v.do(res);
//     } else {
//       data[k] = res;
//     }
//   }
// };
