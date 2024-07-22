export const dynamic = "force-dynamic";

const CHROMIUM_PATH =
  "https://vomrghiulbmrfvmhlflk.supabase.co/storage/v1/object/public/chromium-pack/chromium-v123.0.0-pack.tar";

export async function getBrowser() {
  if (process.env.VERCEL_ENV === "production") {
    try {
      const chromium = await import("@sparticuz/chromium-min").then(
        (mod) => mod.default
      );

      const puppeteerCore = await import("puppeteer-core").then(
        (mod) => mod.default
      );

      const executablePath = await chromium.executablePath(CHROMIUM_PATH);

      const browser: any = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless as any,
      });
      return browser;
    } catch (err: any) {
      console.log(err.message);
      throw err;
    }
  } else {
    const puppeteer = await import("puppeteer").then((mod) => mod.default);

    const browser = await puppeteer.launch();
    return browser;
  }
}
