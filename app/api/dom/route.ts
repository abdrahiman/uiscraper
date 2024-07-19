import { ISelector } from "@/app/components/Selector";
import axios, { AxiosError } from "axios";
import { JSDOM } from "jsdom";
import pLimit from "p-limit";

export const GET = () => Response.json("Hello");

export const POST = async (req: Request) => {
  try {
    const { template, urls } = await req.json();
    const expandedUrls = expandUrls(urls);
    const data = await processBatches(expandedUrls, template);
    return Response.json(data.flat());
  } catch (err: any) {
    return Response.json(err.message, { status: 500 });
  }
};

const getFromParentTemplate: any = (doc: Document, template: ISelector) => {
  const parents = doc.querySelectorAll(template.selector);
  if (template.isArray) {
    return {
      [template.name]: Array.from(parents).map((parent) =>
        template.children.reduce(
          (acc, child) => ({ ...acc, ...getFromTemplate(parent, child) }),
          {}
        )
      ),
    };
  }
  const parent = doc.querySelector(template.selector);
  return {
    [template.name]: parent
      ? template.children.map((child) => getFromTemplate(parent, child))
      : 404,
  };
};

const getFromTemplate = (doc: any, template: ISelector) => {
  if (template.children.length) return getFromParentTemplate(doc, template);
  if (template.isArray) {
    const elements = doc.querySelectorAll(template.selector);
    if (elements.length == 0) {
      return {
        [template.name]: [404],
      };
    }
    return {
      [template.name]: Array.from(elements).map((el: any) =>
        template.attr
          ? el.getAttribute(template.attr)
            ? el.getAttribute(template.attr)
            : 404
          : el.textContent
          ? el.textContent
          : 404
      ),
    };
  }
  return {
    [template.name]: template.attr
      ? doc.querySelector(template.selector)
        ? doc.querySelector(template.selector).getAttribute(template.attr)
        : 404
      : doc.querySelector(template.selector)
      ? doc.querySelector(template.selector).textContent
      : 404,
  };
};

const expandUrls = (urls: string[]): string[] => {
  const firstUrl = urls[0];
  if (!firstUrl.includes("{$i=")) return urls;
  const maxStr = firstUrl.split("{$i=")[1];
  if (maxStr.startsWith(">")) {
    const max = parseInt(maxStr.split("}")[0]);
    if (isNaN(max)) throw new Error("Invalid max value");
    return Array.from({ length: max }, (_, i) =>
      firstUrl.replace(`{$i=>${max}}`, i.toString())
    );
  } else {
    const min = parseInt(maxStr.split("=>")[0]);
    const max = parseInt(maxStr.split("=>")[1].split("}")[0]);
    if (isNaN(max) || isNaN(min)) throw new Error("Invalid max or min value");
    return Array.from({ length: max - min + 1 }, (_, idx) => {
      const i = min + idx;
      return firstUrl.replace(`{$i=${min}=>${max}}`, i.toString());
    });
  }
};

const processBatches = async (urls: string[], template: ISelector[]) => {
  const batchSize = 10; // Adjust based on server capacity
  const limit = pLimit(5); // Limit concurrent requests
  const results: any[] = [];

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((url) => limit(() => processUrl(url, template)))
    );
    results.push(...batchResults);

    // Optional: Add a delay between batches
    if (i + batchSize < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  return results;
};

const processUrl = async (url: string, template: ISelector[]) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const html = await getDoc(url);
      const doc = new JSDOM(html).window.document;
      return template.map((tpl) => getFromTemplate(doc, tpl));
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 503) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error(`Failed to process URL after ${maxRetries} retries: ${url}`);
};

const getDoc = async (url: string) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10 seconds timeout
    });
    return data;
  } catch (err: any) {
    throw err;
  }
};
