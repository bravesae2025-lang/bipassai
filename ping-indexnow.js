#!/usr/bin/env node
/*
 * IndexNow submitter for Bipass AI
 * Usage:  node ping-indexnow.js https://bipassai.com/blog/<slug>.html
 *
 * Run this ONLY after the URL is actually live on Railway. Pinging a URL that
 * 404s tells Bing/Yandex to crawl a dead page.
 *
 * Requires the key file https://bipassai.com/k9x2mQ7pL4nR8vT3wY6jB1.txt to be
 * deployed (it lives at the project root and is served by Express static).
 */

import https from "https";

const INDEXNOW_KEY = "k9x2mQ7pL4nR8vT3wY6jB1";

function pingIndexNow(url) {
  const endpoint =
    "https://api.indexnow.org/indexnow?url=" +
    encodeURIComponent(url) +
    "&key=" + INDEXNOW_KEY;
  return new Promise((resolve) => {
    https
      .get(endpoint, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      })
      .on("error", (err) => resolve({ status: null, body: err.message }));
  });
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node ping-indexnow.js https://bipassai.com/blog/<slug>.html");
    process.exit(1);
  }
  if (!/^https?:\/\//.test(url)) {
    console.error("Pass a full URL (including https://).");
    process.exit(1);
  }

  console.log("Submitting to IndexNow:", url);
  const { status, body } = await pingIndexNow(url);
  console.log("IndexNow response status:", status);
  if (body) console.log("Body:", body.slice(0, 300));

  // 200 and 202 both mean accepted.
  if (status === 200 || status === 202) {
    console.log("Submitted successfully.");
  } else {
    console.log("Not accepted. Check that the key file is live and the URL is correct.");
    process.exit(1);
  }
}

main();
