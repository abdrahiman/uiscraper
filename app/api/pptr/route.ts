import { ISelector } from "@/components/Selector";
import { AxiosError } from "axios";
import pLimit from "p-limit";
import * as puppeteer from "puppeteer";
import { getBrowser } from "@/lib/browser";
import { Browser } from "puppeteer";

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

const getFromTemplate = async (
  page: puppeteer.Page,
  template: ISelector,
  context?: puppeteer.ElementHandle
) => {
  if (template.children.length) return getFromParentTemplate(page, template);

  const elements = context
    ? await context.$$(template.selector)
    : await page.$$(template.selector);

  if (template.isArray) {
    if (elements.length === 0) return { [template.name]: [404] };
    const results = await Promise.all(
      elements.map(async (el) => {
        if (template.attr) {
          const attrValue = await el.evaluate(
            (node, attr) => node.getAttribute(attr),
            template.attr
          );
          return attrValue || 404;
        }
        return (await el.evaluate((node) => node.textContent)) || 404;
      })
    );
    return { [template.name]: results };
  }

  const element = elements[0];
  if (!element) return { [template.name]: 404 };

  if (template.attr) {
    const attrValue = await element.evaluate(
      (node, attr) => node.getAttribute(attr),
      template.attr
    );
    return { [template.name]: attrValue || 404 };
  }
  const textContent = await element.evaluate((node) => node.textContent);
  return { [template.name]: textContent || 404 };
};

const getFromParentTemplate: any = async (
  page: puppeteer.Page,
  template: ISelector
) => {
  const parents = await page.$$(template.selector);
  if (template.isArray) {
    const results = await Promise.all(
      parents.map(async (parent) => {
        const childResults = await Promise.all(
          template.children.map((child) => getFromTemplate(page, child, parent))
        );
        return Object.assign({}, ...childResults);
      })
    );
    return { [template.name]: results };
  }
  const parent = await page.$(template.selector);
  if (!parent) return { [template.name]: 404 };
  const childResults = await Promise.all(
    template.children.map((child) => getFromTemplate(page, child, parent))
  );
  return { [template.name]: childResults };
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
  const batchSize = 10;
  const limit = pLimit(5);
  const results: any[] = [];

  const browser = (await getBrowser()) as Browser;

  try {
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((url) => limit(() => processUrl(browser, url, template)))
      );
      results.push(...batchResults);

      if (i + batchSize < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } finally {
    await browser.close();
  }

  return results;
};

const processUrl = async (
  browser: puppeteer.Browser,
  url: string,
  template: ISelector[]
) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (["image", "stylesheet", "font"].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });

      const result = await Promise.all(
        template.map((tpl) => getFromTemplate(page, tpl))
      );
      await page.close();
      return result;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 503) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error(`Failed to process URL after ${maxRetries} retries: ${url}`);
};
