// scrapeJobs.js
import fs from "fs";
import puppeteer from "puppeteer";

async function scrapeIndeed() {
  const url = "https://in.indeed.com/jobs?q=software+developer&l=India";

  // Launch headless browser
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Go to the Indeed URL
  await page.goto(url, { waitUntil: "networkidle2" });

  // Wait for jobs to load
  await page.waitForSelector(".job_seen_beacon");

  // Extract job details
  const jobs = await page.evaluate(() => {
    const jobList = [];
    document.querySelectorAll(".job_seen_beacon").forEach((el, i) => {
      const title = el.querySelector("h2.jobTitle span")?.innerText || "";
      const company = el.querySelector(".companyName")?.innerText || "";
      const location = el.querySelector(".companyLocation")?.innerText || "";
      const link = "https://in.indeed.com" + (el.querySelector("a")?.getAttribute("href") || "");

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
    });
    return jobList;
  });

  // Save to JSON
  fs.writeFileSync("Jobdetails.json", JSON.stringify(jobs, null, 2));
  console.log(`Jobs scraped successfully! Total jobs: ${jobs.length}`);

  await browser.close();
}

scrapeIndeed();
