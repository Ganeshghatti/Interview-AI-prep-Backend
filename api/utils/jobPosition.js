import { scrapApplyLinks } from "./puppeteerScrapper.js";
import { scrappedDataForJobPosition } from "./jobScrapper.js";

import axios from "axios";

async function main(query) {
    const applyLinks = await scrapApplyLinks(query);
    for (const link of applyLinks) {
        const jobData = await scrappedDataForJobPosition(link);
        await axios.post("http://localhost:5000/admin/job-positions", jobData);
        console.log(jobData);
    };
};

main("Product Manager jobs in bangalore in india in 24 hours");