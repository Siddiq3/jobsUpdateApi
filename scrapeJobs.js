import fs from "fs";
import puppeteer from "puppeteer";

async function scrapeIndeed() {
  const url = "https://in.indeed.com/jobs?q=software+developer&l=India";

  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();

  // Set a realistic user agent to avoid bot detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  await page.goto(url, { waitUntil: "networkidle2" });

  // Try multiple selectors (in case Indeed changed layout)
  const selectors = [".job_seen_beacon", ".result", ".jobCard"];
  let found = false;
  for (const selector of selectors) {
    const exists = await page.$(selector);
    if (exists) {
      found = true;
      break;
    }
  }

  if (!found) {
    console.log("No job listings found! The selector might have changed or page blocked.");
    await browser.close();
    return;
  }

  // Grab all job listings that match any known selector
  const jobs = await page.evaluate(() => {
    const jobList = [];
    const elements = document.querySelectorAll("[class*='job']");
    elements.forEach((el, i) => {
      const title = el.querySelector("h2 span")?.innerText || "";
      const company = el.querySelector(".companyName")?.innerText || "";
      const location = el.querySelector(".companyLocation")?.innerText || "";
      const link = "https://in.indeed.com" + (el.querySelector("a")?.getAttribute("href") || "");

      if (title && company) {
        jobList.push({
          id: i + 1,
          title,
          company,
          location,
          salary: "Not Disclosed",
          type: "Full Time",
          description: "Apply via link",
          applyLink: link
        });
      }
    });
    return jobList;
  });

fs.writeFileSync("Jobdetails.json", JSON.stringify({
  lastUpdated: new Date().toISOString(),
  jobs
}, null, 2));
  console.log(`Jobs scraped successfully! Total jobs: ${jobs.length}`);

  await browser.close();
}

scrapeIndeed();
