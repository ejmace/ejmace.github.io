'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "68b8ecc717cdeebbd2d9dc352cd6732d",
"splash/img/light-2x.png": "93153412895c2230f7ea578527c2b50a",
"splash/img/dark-4x.png": "efaf3f1bbf8982f8c028d9a0cb756c76",
"splash/img/light-3x.png": "77e0b872da427335f3ae89b1e5056824",
"splash/img/dark-3x.png": "77e0b872da427335f3ae89b1e5056824",
"splash/img/light-4x.png": "efaf3f1bbf8982f8c028d9a0cb756c76",
"splash/img/dark-2x.png": "93153412895c2230f7ea578527c2b50a",
"splash/img/dark-1x.png": "7439b19ee64047a44277c590da317724",
"splash/img/light-1x.png": "7439b19ee64047a44277c590da317724",
"splash/style.css": "882579d3650ab547e1c0ec73c5149ef4",
"favicon.ico": "b54bbc63abead988667577d4c4c5083d",
"index.html": "89f6d1c79d8296452025bc2e709d13fb",
"/": "89f6d1c79d8296452025bc2e709d13fb",
"main.dart.js": "8d7e8ec3e5ed628faa251f0753fadf50",
"favicon.png": "89c2aabb8a2fba5d29363d5e9adf9e0f",
"icons/Icon-192.png": "549469a846f313f21846f91ee60ee88f",
"icons/Icon-maskable-192.png": "549469a846f313f21846f91ee60ee88f",
"icons/Icon-maskable-512.png": "3a59e529dd95ea4cb8515afb168e77cc",
"icons/Icon-512.png": "3a59e529dd95ea4cb8515afb168e77cc",
"manifest.json": "525cbd17d4dae7dc20a569cbc4a82552",
"assets/AssetManifest.json": "3bc39fad8b06a3fe4562120eca8b7d70",
"assets/NOTICES": "564d6e00c1331d6c7bd1851d8d613df9",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/lib/assets/images/warning.png": "b3b0229a67a44900f558d0f249387bab",
"assets/lib/assets/images/BlueBin3.png": "4f1616d4ca40a7324932e2c59a59a970",
"assets/lib/assets/images/WasteSync_ca.png": "24e2583fe376c758b43ef9c9a1a50b08",
"assets/lib/assets/images/WebAppLogo.png": "07fe09d0baf419b3adc3311bb337a748",
"assets/lib/assets/images/64.png": "f4fe33607529a1960998a1894984df17",
"assets/lib/assets/images/Icon_v23.svg": "fdd26de44ec90dca9744bd705d906516",
"assets/lib/assets/images/Icon%2520v23.png": "a41b508bb2cfacd41ad4784760453abc",
"assets/lib/assets/images/AppleStoreIcon.png": "4d45436274b04d904274db94089c5935",
"assets/lib/assets/images/GooglePlayIcon.png": "5495cac13bea7559856112c6a6b7fbad",
"assets/lib/assets/images/BlackBin4.png": "ffd0200f9c9608a456ed4a3d6f2039dc",
"assets/lib/assets/images/GreenBin5.png": "76e988f24b9e0fbca891df750d9bd76a",
"assets/lib/assets/images/WMF7.png": "cca3a05cd425edad908969e622674af3",
"assets/lib/assets/images/PenholdWasteSort.png": "ac8cdc9f9ab4cba655c0b993ddb20e93",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
