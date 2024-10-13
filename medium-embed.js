(function () {
  const container = document.getElementById("medium-embed-container");
  const mediumUrl = container.getAttribute("data-medium-url");
  const showTitle = container.getAttribute("data-show-title") === "true";
  const showSubtitle = container.getAttribute("data-show-subtitle") === "true";
  const showFeaturedImage =
    container.getAttribute("data-show-featured-image") === "true";
  const showAuthor = container.getAttribute("data-show-author") === "true";
  const showDate = container.getAttribute("data-show-date") === "true";
  const articleCount =
    parseInt(container.getAttribute("data-article-count")) || 5;

  function fetchRSSFeed(url) {
    return fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "ok") {
          return data.items.slice(0, articleCount);
        } else {
          throw new Error("Failed to fetch RSS feed");
        }
      });
  }

  function extractFeaturedImage(description) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(description, "text/html");
    const firstImage = doc.querySelector("img");
    return firstImage ? firstImage.src : null;
  }

  function extractSubtitle(description) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(description, "text/html");
    const h4 = doc.querySelector("h4");
    const mediumFeedSnippet = doc.querySelector(".medium-feed-snippet");
    return h4
      ? h4.textContent
      : mediumFeedSnippet
      ? mediumFeedSnippet.textContent
      : "";
  }

  function renderPosts(posts) {
    const postsList = posts
      .map((post) => {
        const featuredImage = showFeaturedImage
          ? extractFeaturedImage(post.description)
          : null;
        const subtitle = showSubtitle ? extractSubtitle(post.description) : "";
        return `
        <li class="mb-6">
          ${
            showTitle
              ? `<h3 class="font-semibold text-lg mb-2"><a href="${post.link}" target="_blank" rel="noopener noreferrer" class="text-gray-800 hover:underline">${post.title}</a></h3>`
              : ""
          }
          ${
            showSubtitle && subtitle
              ? `<p class="text-gray-600 mb-2">${subtitle}</p>`
              : ""
          }
          ${
            featuredImage
              ? `<img src="${featuredImage}" alt="Featured image for ${post.title}" class="w-full h-48 object-cover mb-2 rounded">`
              : ""
          }
          <p class="text-gray-600 text-sm">
            ${showAuthor ? post.author : ""}
            ${showAuthor && showDate ? " - " : ""}
            ${showDate ? new Date(post.pubDate).toLocaleDateString() : ""}
          </p>
          <a href="${
            post.link
          }" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-sm">Read more</a>
        </li>
      `;
      })
      .join("");

    const iframeContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        </style>
      </head>
      <body class="bg-white p-6">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-2xl font-bold mb-4 text-gray-900">Latest Medium Posts</h2>
          <ul class="list-none p-0">
            ${postsList}
          </ul>
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.srcdoc = iframeContent;
    iframe.width = "100%";
    iframe.style.border = "none";
    iframe.onload = () => {
      iframe.style.height =
        iframe.contentWindow.document.body.scrollHeight + "px";
    };

    container.innerHTML = "";
    container.appendChild(iframe);
  }

  fetchRSSFeed(mediumUrl)
    .then(renderPosts)
    .catch((error) => {
      console.error("Error fetching Medium posts:", error);
      container.innerHTML =
        "<p style='color: #ff0000;'>Error loading Medium posts. Please try again later.</p>";
    });
})();
