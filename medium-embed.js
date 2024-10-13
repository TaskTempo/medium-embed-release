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
  const layout = container.getAttribute("data-layout") || "default";
  const cardsPerRow =
    parseInt(container.getAttribute("data-cards-per-row")) || 2;

  // Create and display the loader
  container.innerHTML = `
    <div id="medium-embed-loader" class="flex justify-center items-center" style="height: 100px;">
      <p class="text-gray-700 font-semibold">Loading...</p>
    </div>
  `;

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

    // Check for member-only articles first
    const mediumFeedSnippet = doc.querySelector(".medium-feed-snippet");
    if (mediumFeedSnippet) {
      return mediumFeedSnippet.textContent.trim();
    }

    // For public articles
    const elements = Array.from(doc.body.children);

    // Check if the first element is h4
    if (elements.length > 0 && elements[0].tagName.toLowerCase() === "h4") {
      return elements[0].textContent.trim();
    }

    // Check if the first element is h3 and the second is h4 or p
    if (
      elements.length > 1 &&
      elements[0].tagName.toLowerCase() === "h3" &&
      elements[1].tagName.toLowerCase() === "h4"
    ) {
      return elements[1].textContent.trim();
    }

    // If no subtitle found
    return "";
  }

  function renderDefaultLayout(posts) {
    return posts
      .map((post) => {
        const featuredImage = showFeaturedImage
          ? extractFeaturedImage(post.description)
          : null;
        const subtitle = showSubtitle ? extractSubtitle(post.description) : "";
        return `
        <li class="mb-6">
          <div class="flex flex-col md:flex-row md:items-center">
            ${
              featuredImage
                ? `
              <div class="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                <div class="relative pb-[56.25%]">
                  <img src="${featuredImage}" alt="Featured image for ${post.title}" class="absolute top-0 left-0 w-full h-full object-cover rounded">
                </div>
              </div>
            `
                : ""
            }
            <div class="${featuredImage ? "md:w-2/3" : "w-full"}">
              ${
                showTitle
                  ? `<h3 class="font-semibold text-lg mb-2">
                  <a href="${post.link}" target="_blank" rel="noopener noreferrer" 
                     class="text-blue-600 hover:underline flex items-center">
                    ${post.title}
                  </a>
                </h3>`
                  : ""
              }
              ${
                showSubtitle && subtitle
                  ? `<p class="text-gray-600 mb-2">${subtitle}</p>`
                  : ""
              }
              <p class="text-gray-600 text-sm">
                ${showAuthor ? post.author : ""}
                ${showAuthor && showDate ? " - " : ""}
                ${showDate ? new Date(post.pubDate).toLocaleDateString() : ""}
              </p>
            </div>
          </div>
        </li>
      `;
      })
      .join("");
  }

  function renderCardLayout(posts) {
    const cardWidth = 100 / cardsPerRow;
    return `
      <div class="grid grid-cols-1 sm:grid-cols-${cardsPerRow} gap-4">
        ${posts
          .map((post) => {
            const featuredImage = showFeaturedImage
              ? extractFeaturedImage(post.description)
              : null;
            const subtitle = showSubtitle
              ? extractSubtitle(post.description)
              : "";
            return `
            <a href="${
              post.link
            }" target="_blank" rel="noopener noreferrer" class="block group">
              <article class="overflow-hidden rounded-lg shadow transition group-hover:shadow-lg">
                ${
                  showFeaturedImage
                    ? `
                <img
                  alt="Featured image for ${post.title}"
                  src="${featuredImage}"
                  class="h-56 w-full object-cover"
                />
              `
                    : ""
                }
                <div class="bg-white p-4 sm:p-6">
                  ${
                    showDate
                      ? `<time datetime="${
                          post.pubDate
                        }" class="block text-xs text-gray-500">
                          ${new Date(post.pubDate).toLocaleDateString()}
                         </time>`
                      : ""
                  }
                  ${
                    showTitle
                      ? `<h3 class="mt-0.5 text-lg text-gray-900 group-hover:underline">${post.title}</h3>`
                      : ""
                  }
                  ${
                    showSubtitle && subtitle
                      ? `<p class="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">${subtitle}</p>`
                      : ""
                  }
                  ${
                    showAuthor
                      ? `<p class="mt-2 text-sm text-gray-500">${post.author}</p>`
                      : ""
                  }
                </div>
              </article>
            </a>
          `;
          })
          .join("")}
      </div>
    `;
  }

  function renderArtisticCardLayout(posts) {
    return posts
      .map((post) => {
        const featuredImage = showFeaturedImage
          ? extractFeaturedImage(post.description)
          : null;
        const subtitle = showSubtitle ? extractSubtitle(post.description) : "";
        const date = new Date(post.pubDate);

        return `
        <article class="flex bg-white transition hover:shadow-xl mb-4">
          ${
            showDate
              ? `
          <div class="rotate-180 p-2 [writing-mode:_vertical-lr]">
            <time
              datetime="${post.pubDate}"
              class="flex items-center justify-between gap-4 text-xs font-bold uppercase text-gray-900"
            >
              <span>${date.getFullYear()}</span>
              <span class="w-px flex-1 bg-gray-900/10"></span>
              <span>${date.toLocaleString("default", {
                month: "short",
              })} ${date.getDate()}</span>
            </time>
          </div>
          `
              : ""
          }

          ${
            showFeaturedImage
              ? `
          <div class="hidden sm:block sm:basis-56">
            <img
              alt="Featured image for ${post.title}"
              src="${featuredImage}"
              class="aspect-square h-full w-full object-cover"
            />
          </div>
          `
              : ""
          }

          <div class="flex flex-1 flex-col justify-between">
            <div class="border-s border-gray-900/10 p-4 sm:border-l-transparent sm:p-6">
              ${
                showTitle
                  ? `
              <a href="${post.link}" target="_blank" rel="noopener noreferrer">
                <h3 class="font-bold uppercase text-gray-900">
                  ${post.title}
                </h3>
              </a>
              `
                  : ""
              }

              ${
                showSubtitle && subtitle
                  ? `
              <p class="mt-2 line-clamp-3 text-sm/relaxed text-gray-700">
                ${subtitle}
              </p>
              `
                  : ""
              }

              ${
                showAuthor
                  ? `
              <p class="mt-2 text-sm text-gray-500">${post.author}</p>
              `
                  : ""
              }
            </div>

            <div class="sm:flex sm:items-end sm:justify-end">
              <a
                href="${post.link}"
                target="_blank"
                rel="noopener noreferrer"
                class="block bg-gray-300 px-5 py-3 text-center text-xs font-bold uppercase text-gray-900 transition hover:bg-gray-400"
              >
                Read Blog
              </a>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  function renderPosts(posts) {
    let postsList;
    if (layout === "card") {
      postsList = renderCardLayout(posts);
    } else if (layout === "artistic") {
      postsList = renderArtisticCardLayout(posts);
    } else {
      postsList = renderDefaultLayout(posts);
    }

    const iframeContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body class="bg-white">
        <div class="w-full max-w-3xl mx-auto">
          <h2 class="text-2xl font-bold mb-4 text-gray-900">Latest Medium Posts</h2>
          ${
            layout === "default"
              ? `<ul class="list-none p-0">${postsList}</ul>`
              : postsList
          }
        </div>
      </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.srcdoc = iframeContent;
    iframe.width = "100%";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.style.opacity = "0";
    iframe.style.transition = "opacity 0.3s ease-in-out";

    iframe.onload = () => {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newHeight = Math.max(
            entry.contentRect.height,
            entry.target.scrollHeight,
            entry.target.offsetHeight
          );
          iframe.style.height = newHeight + 20 + "px"; // Add 20px buffer
        }
      });

      resizeObserver.observe(iframe.contentDocument.documentElement);

      // Double-check after a short delay
      setTimeout(() => {
        const docHeight = iframe.contentDocument.documentElement.offsetHeight;
        if (parseInt(iframe.style.height) < docHeight) {
          iframe.style.height = docHeight + 20 + "px";
        }
        // Remove the loader and show the iframe
        container.removeChild(document.getElementById("medium-embed-loader"));
        iframe.style.opacity = "1";
      }, 500);
    };

    container.appendChild(iframe);
  }

  fetchRSSFeed(mediumUrl)
    .then(renderPosts)
    .catch((error) => {
      console.error("Error fetching Medium posts:", error);
      container.innerHTML =
        "<p style='color: #ff0000;'>Error loading Medium posts. Please try again later or make sure the URL is not a 404 page.</p>";
    });
})();
