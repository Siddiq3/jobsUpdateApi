import fs from "fs";
import fetch from "node-fetch";
import cheerio from "cheerio";

async function scrapeIndeed() {
  const url = "https://in.indeed.com/jobs?q=software+developer&l=India";

  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const jobs = [];

  $(".job_seen_beacon").each((i, el) => {
    const title = $(el).find("h2.jobTitle span").text();
    const company = $(el).find(".companyName").text();
    const location = $(el).find(".companyLocation").text();
    const link = "https://in.indeed.com" + $(el).find("a").attr("href");

    jobs.push({
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

  fs.writeFileSync("Jobdetails.json", JSON.stringify(jobs, null, 2));
  console.log("Jobs scraped successfully!");
}

scrapeIndeed();
