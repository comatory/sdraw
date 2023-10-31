const STATIC_CACHE_NAME = "static";
const STATIC_CACHE_VERSION = "v21";
const STATIC_CACHE_ID = `${STATIC_CACHE_NAME}-${STATIC_CACHE_VERSION}`;

// All the files need to be added here manually. I want to avoid
// having build tool to pre-generate this.
const STATIC_ASSETS = [
  /* HTML etc. */
  "index.html",
  "favicon.ico",
  "manifest.json",

  /* JS */
  "index.mjs",
  "js/boot.mjs",
  "js/canvas.mjs",
  "js/cursor.mjs",
  "js/dom.mjs",
  "js/canvas-utils.mjs",
  "js/svg-utils.mjs",
  "js/controls/gamepad.mjs",
  "js/controls/keyboard.mjs",
  "js/state/constants.mjs",
  "js/state/state.mjs",
  "js/state/storage.mjs",
  "js/state/utils.mjs",
  "js/state/actions/cam.mjs",
  "js/state/actions/canvas.mjs",
  "js/state/actions/controls.mjs",
  "js/state/actions/cursor.mjs",
  "js/state/actions/tool.mjs",
  "js/state/actions/ui.mjs",
  "js/tools/cam.mjs",
  "js/tools/fill.mjs",
  "js/tools/pen.mjs",
  "js/tools/stamp.mjs",
  "js/ui/actions.mjs",
  "js/ui/colors.mjs",
  "js/ui/global.mjs",
  "js/ui/panel.mjs",
  "js/ui/tools.mjs",
  "js/ui/utils.mjs",
  "js/ui/variants.mjs",

  /* CSS */
  "css/cam.css",
  "css/canvas.css",
  "css/dialog.css",
  "css/loader.css",
  "css/main.css",
  "css/panel.css",

  /* Images */
  "img/logo.png",
  "img/icon.png",
  "img/screenshot-desktop.png",
  "img/buttons/clear.svg",
  "img/buttons/info.svg",
  "img/buttons/save.svg",
  "img/stamps/baby.svg",
  "img/stamps/boy.svg",
  "img/stamps/girl.svg",
  "img/stamps/house.svg",
  "img/stamps/man.svg",
  "img/stamps/slot.svg",
  "img/stamps/star.svg",
  "img/stamps/tree.svg",
  "img/stamps/truck.svg",
  "img/stamps/woman.svg",
  "img/tools/cam-cancel.svg",
  "img/tools/cam-take-photo.svg",
  "img/tools/cam.svg",
  "img/tools/fill.svg",
  "img/tools/pen-stroke-width-1.svg",
  "img/tools/pen-stroke-width-2.svg",
  "img/tools/pen-stroke-width-3.svg",
  "img/tools/pen.svg",
  "img/tools/stamp.svg",
];

function handleRejectedRequest(error) {
  console.error(error);
  return new Response(
    "<h1>You are offline.</h1><p>The application needs to go online at least once to work properly</p>",
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
}

async function handleRequest(response, request) {
  if (response) {
    return response;
  }

  if (!response) {
    console.log(`cache miss for ${request.url}`);
  }

  return fetch(request)
    .then((fetchResponse) => fetchResponse)
    .catch(handleRejectedRequest);
}

function onFetch(event) {
  const { request } = event;
  return event.respondWith(
    caches.match(request).then((response) => handleRequest(response, request)),
  );
}

function handleCacheOpen(staticCache) {
  return staticCache.addAll(STATIC_ASSETS);
}

function handleCacheOpenError(error) {
  console.error(error);
  return Promise.reject(error);
}

function handleCacheUpdate(cacheNames) {
  return Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName !== STATIC_CACHE_ID) {
        console.log(`Deleting cache: ${cacheName}`);
        return caches.delete(cacheName);
      }
    }),
  );
}

function finishCacheUpdate() {
  return self.clients.claim();
}

function handleCacheUpdateError(error) {
  console.error(error);
  return Promise.reject(error);
}

addEventListener("install", function onInstall(event) {
  console.log("Installing service worker");

  return event.waitUntil(
    caches
      .open(STATIC_CACHE_ID)
      .then(handleCacheOpen)
      .catch(handleCacheOpenError),
  );
});

addEventListener("activate", function onActivate(event) {
  console.log("Activating service worker");

  return event.waitUntil(
    caches
      .keys()
      .then(handleCacheUpdate)
      .then(finishCacheUpdate)
      .catch(handleCacheUpdateError),
  );
});

addEventListener("fetch", onFetch);
