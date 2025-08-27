const fetch = require("node-fetch"); // npm install node-fetch@2

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { title, content } = JSON.parse(event.body);

  if (!title || !content) {
    return { statusCode: 400, body: JSON.stringify({ error: "Title and content required" }) };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = "skawli-cloud"; // نام کاربری GitHub شما
  const REPO_NAME = "sepidehqods";   // نام مخزن شما
  const BRANCH = "main";             // شاخه اصلی مخزن

  // ایجاد نام فایل از عنوان پست
  const filename = "posts/" + title.toLowerCase().replace(/[^a-z0-9\-]/g, "-") + ".md";

  // محتوای فایل Markdown
  const markdown = `---
title: ${title}
date: ${new Date().toISOString().split("T")[0]}
---

${content}`;

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`;

  // ارسال درخواست به GitHub API
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "NetlifyFunction"
    },
    body: JSON.stringify({
      message: `Add new post: ${title}`,
      content: Buffer.from(markdown).toString("base64"),
      branch: BRANCH
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return { statusCode: 500, body: JSON.stringify({ error: "GitHub API error", data }) };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true, message: "Post created" }) };
};
