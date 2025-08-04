const puppeteer = require("puppeteer");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapApplyLinks(query) {
  const uniqueApplyLinks = [];

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    await page.goto("https://www.google.com/advanced_search", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector(".jfk-textinput");
    await page.type(
      ".jfk-textinput",
      query,
      { delay: Math.random() * 200 + 100 }
    );
    await page.click(".jfk-button.jfk-button-action.dUBGpe");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await delay(1000);
    await page.waitForSelector("a.C6AK7c");
    const jobLinks = await page.$$("a.C6AK7c");
    for (const link of jobLinks) {
      const text = await link.evaluate((el) => el.innerText.trim());
      if (text === "Jobs") {
        await link.evaluate((el) => el.scrollIntoView());
        await link.click({ delay: Math.random() * 200 + 100 });
        console.log("Clicked Jobs tab");
        break;
      }
    }
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    const scrapedHrefs = new Set();
    let processed = 0;
    const MAX_JOBS = 25;

    while (processed < MAX_JOBS) {
      await page.waitForSelector("a.MQUd2b", { timeout: 10000 });
      await delay(1000);

      const jobCards = await page.$$("a.MQUd2b");
      for (let i = 0; i < jobCards.length; i++) {
        const job = jobCards[i];
        const href = await job.evaluate((el) => el.href);
        if (scrapedHrefs.has(href)) continue;
        scrapedHrefs.add(href);

        await delay(1000);
        const box = await job.boundingBox();
        if (!box) {
          console.log("Job card not visible or stale, skipping...");
          continue;
        }

        // Save previous title BEFORE clicking
        const previousTitle = await page.evaluate(() =>
          document.querySelector("h1.LZAQDf.cS4Vcb-pGL6qe-IRrXtf")?.innerText.trim() || ""
        );

        try {
          await job.click({ delay: Math.random() * 200 + 100 });

          // Wait for title to change after click
          await page.waitForFunction(
            (prevTitle) => {
              const el = document.querySelector("h1.LZAQDf.cS4Vcb-pGL6qe-IRrXtf");
              return el && el.innerText.trim() !== prevTitle;
            },
            { timeout: 5000 },
            previousTitle
          );
        } catch (err) {
          console.log("Click or title change failed, skipping job. Error:", err.message);
          continue;
        }

        await delay(1000);

        // Click "Show full description" if exists
        const showDescBtn = await page.$(".nNzjpf-cS4Vcb-PvZLI-vK2bNd-fmcmS");
        if (showDescBtn) {
          try {
            await showDescBtn.click();
            await delay(500);
          } catch (err) {
            console.log("Failed to click 'Show full description', skipping...");
          }
        }

        // Scrape job details
        const data = await page.evaluate(() => {
          const getText = (selector) =>
            document.querySelector(selector)?.innerText.trim() || "";
          const getLinks = () => {
            return [...document.querySelectorAll("a.nNzjpf-cS4Vcb-PvZLI-Ueh9jd-LgbsSe-Jyewjb-tlSJBe[href]")]
              .map((a) => a.href)
              .filter((href) => href.startsWith("http"))
              .map((href) => href.split("?")[0]);
          };
          const getTextAtIndex = (selector, index) => {
            const elements = document.querySelectorAll(selector);
            return elements[index]?.innerText.trim() || "";
          };

          return {
            title: getText("h1.LZAQDf.cS4Vcb-pGL6qe-IRrXtf"),
            company: getText("div.UxTHrf"),
            location: getText("div.waQ7qe.cS4Vcb-pGL6qe-ysgGef"),
            type: getTextAtIndex("span.RcZtZb", 1),
            description: getText("div.NgUYpe"),
            links: getLinks(),
          }
        });

        if(data.links.length > 0) {
          uniqueApplyLinks.push(data.links[0]);
        }

        processed++;
        console.log(`\nJob ${processed} of ${MAX_JOBS}`);
        console.log(`Title     : ${data.title}`);
        console.log(`Company   : ${data.company}`);
        console.log(`Location  : ${data.location}`);
        console.log(`Type      : ${data.type}`);
        console.log(`Description:\n${data.description.slice(0, 500)}...`);
        console.log(`Apply Links: ${data.links.join(", ")}`);

        if (processed >= MAX_JOBS) break;
      }

      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(1500);
    }

    console.log(`\n✅ Done. Scraped ${processed} job(s).`);
    return uniqueApplyLinks;
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
}

module.exports = {scrapApplyLinks};
