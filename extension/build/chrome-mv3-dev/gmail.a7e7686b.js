(function(define){var __define; typeof define === "function" && (__define=define,define=null);
// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"6Qyl9":[function(require,module,exports) {
var d = globalThis.process?.argv || [];
var y = ()=>globalThis.process?.env || {};
var H = new Set(d), _ = (e)=>H.has(e), G = d.filter((e)=>e.startsWith("--") && e.includes("=")).map((e)=>e.split("=")).reduce((e, [t, o])=>(e[t] = o, e), {});
var Z = _("--dry-run"), p = ()=>_("--verbose") || y().VERBOSE === "true", q = p();
var u = (e = "", ...t)=>console.log(e.padEnd(9), "|", ...t);
var x = (...e)=>console.error("\uD83D\uDD34 ERROR".padEnd(9), "|", ...e), v = (...e)=>u("\uD83D\uDD35 INFO", ...e), m = (...e)=>u("\uD83D\uDFE0 WARN", ...e), S = 0, c = (...e)=>p() && u(`\u{1F7E1} ${S++}`, ...e);
var n = {
    "isContentScript": true,
    "isBackground": false,
    "isReact": false,
    "runtimes": [
        "script-runtime"
    ],
    "host": "localhost",
    "port": 55257,
    "entryFilePath": "/Users/rushil/Desktop/email:slack- ai assistance/extension/src/contents/gmail.ts",
    "bundleId": "3bc1e448a7e7686b",
    "envHash": "e792fbbdaa78ee84",
    "verbose": "false",
    "secure": false,
    "serverPort": 55256
};
module.bundle.HMR_BUNDLE_ID = n.bundleId;
globalThis.process = {
    argv: [],
    env: {
        VERBOSE: n.verbose
    }
};
var D = module.bundle.Module;
function I(e) {
    D.call(this, e), this.hot = {
        data: module.bundle.hotData[e],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(t) {
            this._acceptCallbacks.push(t || function() {});
        },
        dispose: function(t) {
            this._disposeCallbacks.push(t);
        }
    }, module.bundle.hotData[e] = void 0;
}
module.bundle.Module = I;
module.bundle.hotData = {};
var l = globalThis.browser || globalThis.chrome || null;
function b() {
    return !n.host || n.host === "0.0.0.0" ? "localhost" : n.host;
}
function C() {
    return n.port || location.port;
}
var E = "__plasmo_runtime_script_";
function L(e, t) {
    let { modules: o } = e;
    return o ? !!o[t] : !1;
}
function O(e = C()) {
    let t = b();
    return `${n.secure || location.protocol === "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(t) ? "wss" : "ws"}://${t}:${e}/`;
}
function B(e) {
    typeof e.message == "string" && x("[plasmo/parcel-runtime]: " + e.message);
}
function P(e) {
    if (typeof globalThis.WebSocket > "u") return;
    let t = new WebSocket(O());
    return t.addEventListener("message", async function(o) {
        let r = JSON.parse(o.data);
        if (r.type === "update" && await e(r.assets), r.type === "error") for (let a of r.diagnostics.ansi){
            let w = a.codeframe || a.stack;
            m("[plasmo/parcel-runtime]: " + a.message + `
` + w + `

` + a.hints.join(`
`));
        }
    }), t.addEventListener("error", B), t.addEventListener("open", ()=>{
        v(`[plasmo/parcel-runtime]: Connected to HMR server for ${n.entryFilePath}`);
    }), t.addEventListener("close", ()=>{
        m(`[plasmo/parcel-runtime]: Connection to the HMR server is closed for ${n.entryFilePath}`);
    }), t;
}
var s = "__plasmo-loading__";
function $() {
    let e = globalThis.window?.trustedTypes;
    if (typeof e > "u") return;
    let t = document.querySelector('meta[name="trusted-types"]')?.content?.split(" "), o = t ? t[t?.length - 1].replace(/;/g, "") : void 0;
    return typeof e < "u" ? e.createPolicy(o || `trusted-html-${s}`, {
        createHTML: (a)=>a
    }) : void 0;
}
var T = $();
function g() {
    return document.getElementById(s);
}
function f() {
    return !g();
}
function F() {
    let e = document.createElement("div");
    e.id = s;
    let t = `
  <style>
    #${s} {
      background: #f3f3f3;
      color: #333;
      border: 1px solid #333;
      box-shadow: #333 4.7px 4.7px;
    }

    #${s}:hover {
      background: #e3e3e3;
      color: #444;
    }

    @keyframes plasmo-loading-animate-svg-fill {
      0% {
        fill: transparent;
      }
    
      100% {
        fill: #333;
      }
    }

    #${s} .svg-elem-1 {
      animation: plasmo-loading-animate-svg-fill 1.47s cubic-bezier(0.47, 0, 0.745, 0.715) 0.8s both infinite;
    }

    #${s} .svg-elem-2 {
      animation: plasmo-loading-animate-svg-fill 1.47s cubic-bezier(0.47, 0, 0.745, 0.715) 0.9s both infinite;
    }
    
    #${s} .svg-elem-3 {
      animation: plasmo-loading-animate-svg-fill 1.47s cubic-bezier(0.47, 0, 0.745, 0.715) 1s both infinite;
    }

    #${s} .hidden {
      display: none;
    }

  </style>
  
  <svg height="32" width="32" viewBox="0 0 264 354" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M139.221 282.243C154.252 282.243 166.903 294.849 161.338 308.812C159.489 313.454 157.15 317.913 154.347 322.109C146.464 333.909 135.26 343.107 122.151 348.538C109.043 353.969 94.6182 355.39 80.7022 352.621C66.7861 349.852 54.0034 343.018 43.9705 332.983C33.9375 322.947 27.105 310.162 24.3369 296.242C21.5689 282.323 22.9895 267.895 28.4193 254.783C33.8491 241.671 43.0441 230.464 54.8416 222.579C59.0353 219.777 63.4908 217.438 68.1295 215.588C82.0915 210.021 94.6978 222.671 94.6978 237.703L94.6978 255.027C94.6978 270.058 106.883 282.243 121.914 282.243H139.221Z" fill="#333" class="svg-elem-1" ></path>
    <path d="M192.261 142.028C192.261 126.996 204.867 114.346 218.829 119.913C223.468 121.763 227.923 124.102 232.117 126.904C243.915 134.789 253.11 145.996 258.539 159.108C263.969 172.22 265.39 186.648 262.622 200.567C259.854 214.487 253.021 227.272 242.988 237.308C232.955 247.343 220.173 254.177 206.256 256.946C192.34 259.715 177.916 258.294 164.807 252.863C151.699 247.432 140.495 238.234 132.612 226.434C129.808 222.238 127.47 217.779 125.62 213.137C120.056 199.174 132.707 186.568 147.738 186.568L165.044 186.568C180.076 186.568 192.261 174.383 192.261 159.352L192.261 142.028Z" fill="#333" class="svg-elem-2" ></path>
    <path d="M95.6522 164.135C95.6522 179.167 83.2279 191.725 68.8013 187.505C59.5145 184.788 50.6432 180.663 42.5106 175.227C26.7806 164.714 14.5206 149.772 7.28089 132.289C0.041183 114.807 -1.85305 95.5697 1.83772 77.0104C5.52849 58.4511 14.6385 41.4033 28.0157 28.0228C41.393 14.6423 58.4366 5.53006 76.9914 1.83839C95.5461 -1.85329 114.779 0.0414162 132.257 7.2829C149.735 14.5244 164.674 26.7874 175.184 42.5212C180.62 50.6576 184.744 59.5332 187.46 68.8245C191.678 83.2519 179.119 95.6759 164.088 95.6759L122.869 95.6759C107.837 95.6759 95.6522 107.861 95.6522 122.892L95.6522 164.135Z" fill="#333" class="svg-elem-3"></path>
  </svg>
  <span class="hidden">Context Invalidated, Press to Reload</span>
  `;
    return e.innerHTML = T ? T.createHTML(t) : t, e.style.pointerEvents = "none", e.style.position = "fixed", e.style.bottom = "14.7px", e.style.right = "14.7px", e.style.fontFamily = "sans-serif", e.style.display = "flex", e.style.justifyContent = "center", e.style.alignItems = "center", e.style.padding = "14.7px", e.style.gap = "14.7px", e.style.borderRadius = "4.7px", e.style.zIndex = "2147483647", e.style.opacity = "0", e.style.transition = "all 0.47s ease-in-out", e;
}
function N(e) {
    return new Promise((t)=>{
        document.documentElement ? (f() && (document.documentElement.appendChild(e), t()), t()) : globalThis.addEventListener("DOMContentLoaded", ()=>{
            f() && document.documentElement.appendChild(e), t();
        });
    });
}
var k = ()=>{
    let e;
    if (f()) {
        let t = F();
        e = N(t);
    }
    return {
        show: async ({ reloadButton: t = !1 } = {})=>{
            await e;
            let o = g();
            o.style.opacity = "1", t && (o.onclick = (r)=>{
                r.stopPropagation(), globalThis.location.reload();
            }, o.querySelector("span").classList.remove("hidden"), o.style.cursor = "pointer", o.style.pointerEvents = "all");
        },
        hide: async ()=>{
            await e;
            let t = g();
            t.style.opacity = "0";
        }
    };
};
var W = `${E}${module.id}__`, i, A = !1, M = k();
async function h() {
    c("Script Runtime - reloading"), A ? globalThis.location?.reload?.() : M.show({
        reloadButton: !0
    });
}
function R() {
    i?.disconnect(), i = l?.runtime.connect({
        name: W
    }), i.onDisconnect.addListener(()=>{
        h();
    }), i.onMessage.addListener((e)=>{
        e.__plasmo_cs_reload__ && h(), e.__plasmo_cs_active_tab__ && (A = !0);
    });
}
function j() {
    if (l?.runtime) try {
        R(), setInterval(R, 24e3);
    } catch  {
        return;
    }
}
j();
P(async (e)=>{
    c("Script runtime - on updated assets"), e.filter((o)=>o.envHash === n.envHash).some((o)=>L(module.bundle, o.id)) && (M.show(), l?.runtime ? i.postMessage({
        __plasmo_cs_changed__: !0
    }) : setTimeout(()=>{
        h();
    }, 4700));
});

},{}],"kZZrz":[function(require,module,exports) {
/**
 * Plasmo Content Script \u2014 Gmail AI Assistant
 *
 * Self-contained: NO external imports.
 * Event delegation via document.addEventListener \u2192 survives all Gmail re-renders.
 * Button identified by stable ID attribute.
 */ var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "config", ()=>config);
const config = {
    matches: [
        "https://mail.google.com/*"
    ],
    run_at: "document_idle"
};
// \u2500\u2500\u2500 Config \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const BUTTON_ID = "gmail-ai-reply-btn";
const BUTTON_ATTR = "data-gmail-ai-btn";
const TOAST_ID = "gmail-ai-toast";
const BACKEND_URL = "http://localhost:3000";
// \u2500\u2500\u2500 Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function showToast(message, type = "success") {
    document.getElementById(TOAST_ID)?.remove();
    const colors = {
        success: "#16a34a",
        error: "#dc2626",
        info: "#2563eb"
    };
    const el = document.createElement("div");
    el.id = TOAST_ID;
    Object.assign(el.style, {
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: "2147483647",
        backgroundColor: colors[type],
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        maxWidth: "360px",
        lineHeight: "1.4",
        pointerEvents: "none",
        opacity: "1",
        transition: "opacity 0.3s ease"
    });
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(()=>{
        el.style.opacity = "0";
        setTimeout(()=>el.remove(), 350);
    }, 4000);
}
// \u2500\u2500\u2500 Email Extraction \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function getThreadId() {
    const hash = window.location.hash;
    const parts = hash.replace("#", "").split("/");
    const id = parts[parts.length - 1] ?? "";
    console.log("[Gmail AI] Thread ID:", id, "| hash:", hash);
    return id;
}
function extractEmailData() {
    console.log("[Gmail AI] Extracting email data...");
    const subjectEl = document.querySelector("h2.hP") ?? document.querySelector(".ha h2");
    const subject = subjectEl?.textContent?.trim() ?? document.title.replace(/\s*[-]\s*Gmail$/, "").trim() ?? "(No Subject)";
    console.log("[Gmail AI] Subject:", subject);
    const senderEl = document.querySelector(".gD[email]") ?? document.querySelector("[email][name]") ?? document.querySelector(".go");
    const sender = senderEl?.getAttribute("name") ?? senderEl?.textContent?.trim() ?? "Unknown";
    const senderEmail = senderEl?.getAttribute("email") ?? senderEl?.getAttribute("data-hovercard-id") ?? sender;
    console.log("[Gmail AI] Sender:", sender, senderEmail);
    const bodyEls = Array.from(document.querySelectorAll(".a3s.aiL, .a3s"));
    const bodyEl = bodyEls[bodyEls.length - 1] ?? null;
    let body = bodyEl?.innerText?.trim() ?? "";
    body = body.split("\n").filter((l)=>!l.trim().startsWith(">")).join("\n").trim();
    if (!body) body = bodyEl?.textContent?.trim() ?? "(No body)";
    console.log("[Gmail AI] Body length:", body.length);
    const threadId = getThreadId();
    return {
        subject,
        sender,
        senderEmail,
        body,
        threadId
    };
}
// \u2500\u2500\u2500 Button State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function setBtn(state) {
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;
    btn.setAttribute("data-ai-state", state);
    if (state === "loading") {
        btn.innerHTML = '<span style="font-size:14px">\u23f3</span><span>Generating\u2026</span>';
        btn.style.backgroundColor = "#1557b0";
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.8";
    } else if (state === "success") {
        btn.innerHTML = '<span style="font-size:14px">\u2705</span><span>Draft Created</span>';
        btn.style.backgroundColor = "#16a34a";
        btn.style.pointerEvents = "none";
        btn.style.opacity = "1";
    } else {
        btn.innerHTML = '<span style="font-size:14px;line-height:1">\u2728</span><span>AI Reply</span>';
        btn.style.backgroundColor = "#1a73e8";
        btn.style.pointerEvents = "auto";
        btn.style.opacity = "1";
    }
}
// \u2500\u2500\u2500 Click Handler \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
async function handleClick() {
    console.log("[Gmail AI] ==== AI Reply CLICKED ====");
    console.log("[Gmail AI] URL:", window.location.href);
    const btn = document.getElementById(BUTTON_ID);
    if (btn && btn.getAttribute("data-ai-state") === "loading") {
        console.log("[Gmail AI] Already generating, skip");
        return;
    }
    setBtn("loading");
    try {
        const data = extractEmailData();
        if (!data.threadId) throw new Error("No thread ID in URL \u2014 is an email open?");
        if (!data.body || data.body === "(No body)") throw new Error("Email body not found");
        const payload = {
            subject: data.subject,
            sender: data.sender,
            senderEmail: data.senderEmail,
            body: data.body,
            threadId: data.threadId
        };
        console.log("[Gmail AI] Sending to backend:", JSON.stringify(payload).slice(0, 200));
        const res = await fetch(`${BACKEND_URL}/generate-draft`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        console.log("[Gmail AI] Response status:", res.status);
        const text = await res.text();
        console.log("[Gmail AI] Response body:", text.slice(0, 300));
        if (!res.ok) throw new Error(`Backend error ${res.status}: ${text.slice(0, 150)}`);
        const json = JSON.parse(text);
        console.log("[Gmail AI] Draft created:", json);
        setBtn("success");
        showToast("\u2705 AI Draft Created! Check your Drafts folder.", "success");
        setTimeout(()=>setBtn("idle"), 4000);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[Gmail AI] ERROR:", msg);
        showToast("\u274c Failed: " + msg, "error");
        setBtn("idle");
    }
}
// \u2500\u2500\u2500 Event Delegation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Capture-phase listener on document \u2014 fires even if Gmail stops propagation.
// Matches the button by ID or BUTTON_ATTR regardless of DOM re-renders.
document.addEventListener("click", function(e) {
    const target = e.target;
    if (!target) return;
    const btn = target.closest("#" + BUTTON_ID + ", [" + BUTTON_ATTR + "]");
    if (btn) {
        console.log("[Gmail AI] Delegated click caught on document");
        e.preventDefault();
        e.stopImmediatePropagation();
        handleClick();
    }
}, true);
// \u2500\u2500\u2500 Toolbar Detection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function findToolbar() {
    const ghTm = document.querySelector('div[gh="tm"]');
    if (ghTm) {
        console.log('[Gmail AI] Toolbar: div[gh="tm"]');
        return ghTm;
    }
    for (const tb of Array.from(document.querySelectorAll('[role="toolbar"]')))if (tb.querySelector('[data-tooltip="Archive"],[aria-label="Archive"]') || tb.querySelector('[data-tooltip="Delete"],[aria-label="Delete"]')) {
        console.log("[Gmail AI] Toolbar: role=toolbar");
        return tb;
    }
    for (const sel of [
        '[data-tooltip="More"]',
        '[aria-label="More"]',
        '[data-tooltip="More options"]'
    ]){
        const more = document.querySelector(sel);
        if (!more) continue;
        let node = more.parentElement;
        for(let i = 0; i < 6 && node; i++){
            if (node.querySelectorAll("[data-tooltip]").length >= 3) {
                console.log("[Gmail AI] Toolbar: More-button walk depth", i);
                return node;
            }
            node = node.parentElement;
        }
    }
    const archive = document.querySelector('[data-tooltip="Archive"],[aria-label="Archive"]');
    if (archive) {
        let node = archive.parentElement;
        for(let i = 0; i < 6 && node; i++){
            if (node.querySelectorAll("[data-tooltip],[aria-label]").length >= 3) {
                console.log("[Gmail AI] Toolbar: Archive-button walk depth", i);
                return node;
            }
            node = node.parentElement;
        }
    }
    console.warn("[Gmail AI] Toolbar NOT found");
    return null;
}
// \u2500\u2500\u2500 Injection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function isEmailOpen() {
    const hash = window.location.hash;
    if (!hash.includes("/")) return false;
    const id = hash.split("/").pop() ?? "";
    return id.length >= 8 && /^[a-zA-Z0-9_-]+$/.test(id);
}
function removeButton() {
    document.getElementById(BUTTON_ID)?.remove();
}
function buildButton() {
    const btn = document.createElement("div");
    btn.id = BUTTON_ID;
    btn.setAttribute(BUTTON_ATTR, "true");
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");
    btn.setAttribute("data-ai-state", "idle");
    btn.setAttribute("aria-label", "AI Reply");
    Object.assign(btn.style, {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: "0 14px",
        height: "32px",
        borderRadius: "4px",
        backgroundColor: "#1a73e8",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: "600",
        fontFamily: '"Google Sans",Roboto,Arial,sans-serif',
        cursor: "pointer",
        marginLeft: "8px",
        userSelect: "none",
        flexShrink: "0",
        transition: "background-color 0.15s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        pointerEvents: "auto",
        position: "relative",
        zIndex: "9"
    });
    btn.innerHTML = '<span style="font-size:14px;line-height:1">\u2728</span><span>AI Reply</span>';
    // Direct listener (backup to delegation)
    btn.addEventListener("click", function(e) {
        console.log("[Gmail AI] Direct click on button");
        e.preventDefault();
        e.stopPropagation();
        handleClick();
    }, true);
    btn.addEventListener("mouseenter", ()=>{
        if (btn.getAttribute("data-ai-state") === "idle") btn.style.backgroundColor = "#1557b0";
    });
    btn.addEventListener("mouseleave", ()=>{
        if (btn.getAttribute("data-ai-state") === "idle") btn.style.backgroundColor = "#1a73e8";
    });
    btn.addEventListener("keydown", (e)=>{
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
        }
    });
    return btn;
}
function tryInject() {
    if (document.getElementById(BUTTON_ID)) return true;
    if (!isEmailOpen()) return false;
    const toolbar = findToolbar();
    if (!toolbar) return false;
    const btn = buildButton();
    const more = toolbar.querySelector('[data-tooltip="More"],[aria-label="More"],[data-tooltip="More options"]');
    if (more) {
        more.insertAdjacentElement("afterend", btn);
        console.log("[Gmail AI] \u2705 Injected after More");
    } else {
        toolbar.appendChild(btn);
        console.log("[Gmail AI] \u2705 Injected at end of toolbar");
    }
    return true;
}
// \u2500\u2500\u2500 Bootstrap \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
let debounceTimer = null;
let lastUrl = location.href;
function scheduleInject(ms = 400) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(()=>{
        if (!tryInject()) {
            setTimeout(tryInject, 600);
            setTimeout(tryInject, 1500);
            setTimeout(tryInject, 3000);
        }
    }, ms);
}
function onUrlChange() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    console.log("[Gmail AI] URL changed:", location.href);
    removeButton();
    scheduleInject(350);
}
function bootstrap() {
    console.log("[Gmail AI] Content script bootstrapped | URL:", location.href);
    tryInject();
    scheduleInject(500);
    setTimeout(tryInject, 1200);
    setTimeout(tryInject, 2500);
    setTimeout(tryInject, 5000);
    new MutationObserver(()=>{
        onUrlChange();
        if (isEmailOpen() && !document.getElementById(BUTTON_ID)) scheduleInject(250);
    }).observe(document.body, {
        childList: true,
        subtree: true
    });
    window.addEventListener("hashchange", ()=>{
        console.log("[Gmail AI] hashchange:", location.hash);
        removeButton();
        scheduleInject(350);
    });
    window.addEventListener("popstate", ()=>{
        removeButton();
        scheduleInject(350);
    });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap);
else bootstrap();

},{"@parcel/transformer-js/src/esmodule-helpers.js":"boKlo"}],"boKlo":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}]},["6Qyl9","kZZrz"], "kZZrz", "parcelRequiref190")

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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T0FBTztBQUNUO0FBRUEsUUFBUSxTQUFTLFNBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHO0lBQzVDLE9BQU8sZUFBZSxNQUFNLFVBQVU7UUFDcEMsWUFBWTtRQUNaLEtBQUs7SUFDUDtBQUNGIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvQHBsYXNtb2hxL3BhcmNlbC1ydW50aW1lL2Rpc3QvcnVudGltZS0wODU0NTdlMzNjNDBjOThjLmpzIiwic3JjL2NvbnRlbnRzL2dtYWlsLnRzIiwibm9kZV9tb2R1bGVzL0BwYXJjZWwvdHJhbnNmb3JtZXItanMvc3JjL2VzbW9kdWxlLWhlbHBlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGQ9Z2xvYmFsVGhpcy5wcm9jZXNzPy5hcmd2fHxbXTt2YXIgeT0oKT0+Z2xvYmFsVGhpcy5wcm9jZXNzPy5lbnZ8fHt9O3ZhciBIPW5ldyBTZXQoZCksXz1lPT5ILmhhcyhlKSxHPWQuZmlsdGVyKGU9PmUuc3RhcnRzV2l0aChcIi0tXCIpJiZlLmluY2x1ZGVzKFwiPVwiKSkubWFwKGU9PmUuc3BsaXQoXCI9XCIpKS5yZWR1Y2UoKGUsW3Qsb10pPT4oZVt0XT1vLGUpLHt9KTt2YXIgWj1fKFwiLS1kcnktcnVuXCIpLHA9KCk9Pl8oXCItLXZlcmJvc2VcIil8fHkoKS5WRVJCT1NFPT09XCJ0cnVlXCIscT1wKCk7dmFyIHU9KGU9XCJcIiwuLi50KT0+Y29uc29sZS5sb2coZS5wYWRFbmQoOSksXCJ8XCIsLi4udCk7dmFyIHg9KC4uLmUpPT5jb25zb2xlLmVycm9yKFwiXFx1ezFGNTM0fSBFUlJPUlwiLnBhZEVuZCg5KSxcInxcIiwuLi5lKSx2PSguLi5lKT0+dShcIlxcdXsxRjUzNX0gSU5GT1wiLC4uLmUpLG09KC4uLmUpPT51KFwiXFx1ezFGN0UwfSBXQVJOXCIsLi4uZSksUz0wLGM9KC4uLmUpPT5wKCkmJnUoYFxcdXsxRjdFMX0gJHtTKyt9YCwuLi5lKTt2YXIgbj17XCJpc0NvbnRlbnRTY3JpcHRcIjp0cnVlLFwiaXNCYWNrZ3JvdW5kXCI6ZmFsc2UsXCJpc1JlYWN0XCI6ZmFsc2UsXCJydW50aW1lc1wiOltcInNjcmlwdC1ydW50aW1lXCJdLFwiaG9zdFwiOlwibG9jYWxob3N0XCIsXCJwb3J0XCI6NTUyNTcsXCJlbnRyeUZpbGVQYXRoXCI6XCIvVXNlcnMvcnVzaGlsL0Rlc2t0b3AvZW1haWw6c2xhY2stIGFpIGFzc2lzdGFuY2UvZXh0ZW5zaW9uL3NyYy9jb250ZW50cy9nbWFpbC50c1wiLFwiYnVuZGxlSWRcIjpcIjNiYzFlNDQ4YTdlNzY4NmJcIixcImVudkhhc2hcIjpcImU3OTJmYmJkYWE3OGVlODRcIixcInZlcmJvc2VcIjpcImZhbHNlXCIsXCJzZWN1cmVcIjpmYWxzZSxcInNlcnZlclBvcnRcIjo1NTI1Nn07bW9kdWxlLmJ1bmRsZS5ITVJfQlVORExFX0lEPW4uYnVuZGxlSWQ7Z2xvYmFsVGhpcy5wcm9jZXNzPXthcmd2OltdLGVudjp7VkVSQk9TRTpuLnZlcmJvc2V9fTt2YXIgRD1tb2R1bGUuYnVuZGxlLk1vZHVsZTtmdW5jdGlvbiBJKGUpe0QuY2FsbCh0aGlzLGUpLHRoaXMuaG90PXtkYXRhOm1vZHVsZS5idW5kbGUuaG90RGF0YVtlXSxfYWNjZXB0Q2FsbGJhY2tzOltdLF9kaXNwb3NlQ2FsbGJhY2tzOltdLGFjY2VwdDpmdW5jdGlvbih0KXt0aGlzLl9hY2NlcHRDYWxsYmFja3MucHVzaCh0fHxmdW5jdGlvbigpe30pfSxkaXNwb3NlOmZ1bmN0aW9uKHQpe3RoaXMuX2Rpc3Bvc2VDYWxsYmFja3MucHVzaCh0KX19LG1vZHVsZS5idW5kbGUuaG90RGF0YVtlXT12b2lkIDB9bW9kdWxlLmJ1bmRsZS5Nb2R1bGU9STttb2R1bGUuYnVuZGxlLmhvdERhdGE9e307dmFyIGw9Z2xvYmFsVGhpcy5icm93c2VyfHxnbG9iYWxUaGlzLmNocm9tZXx8bnVsbDtmdW5jdGlvbiBiKCl7cmV0dXJuIW4uaG9zdHx8bi5ob3N0PT09XCIwLjAuMC4wXCI/XCJsb2NhbGhvc3RcIjpuLmhvc3R9ZnVuY3Rpb24gQygpe3JldHVybiBuLnBvcnR8fGxvY2F0aW9uLnBvcnR9dmFyIEU9XCJfX3BsYXNtb19ydW50aW1lX3NjcmlwdF9cIjtmdW5jdGlvbiBMKGUsdCl7bGV0e21vZHVsZXM6b309ZTtyZXR1cm4gbz8hIW9bdF06ITF9ZnVuY3Rpb24gTyhlPUMoKSl7bGV0IHQ9YigpO3JldHVybmAke24uc2VjdXJlfHxsb2NhdGlvbi5wcm90b2NvbD09PVwiaHR0cHM6XCImJiEvbG9jYWxob3N0fDEyNy4wLjAuMXwwLjAuMC4wLy50ZXN0KHQpP1wid3NzXCI6XCJ3c1wifTovLyR7dH06JHtlfS9gfWZ1bmN0aW9uIEIoZSl7dHlwZW9mIGUubWVzc2FnZT09XCJzdHJpbmdcIiYmeChcIltwbGFzbW8vcGFyY2VsLXJ1bnRpbWVdOiBcIitlLm1lc3NhZ2UpfWZ1bmN0aW9uIFAoZSl7aWYodHlwZW9mIGdsb2JhbFRoaXMuV2ViU29ja2V0PlwidVwiKXJldHVybjtsZXQgdD1uZXcgV2ViU29ja2V0KE8oKSk7cmV0dXJuIHQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIixhc3luYyBmdW5jdGlvbihvKXtsZXQgcj1KU09OLnBhcnNlKG8uZGF0YSk7aWYoci50eXBlPT09XCJ1cGRhdGVcIiYmYXdhaXQgZShyLmFzc2V0cyksci50eXBlPT09XCJlcnJvclwiKWZvcihsZXQgYSBvZiByLmRpYWdub3N0aWNzLmFuc2kpe2xldCB3PWEuY29kZWZyYW1lfHxhLnN0YWNrO20oXCJbcGxhc21vL3BhcmNlbC1ydW50aW1lXTogXCIrYS5tZXNzYWdlK2BcbmArdytgXG5cbmArYS5oaW50cy5qb2luKGBcbmApKX19KSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLEIpLHQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwoKT0+e3YoYFtwbGFzbW8vcGFyY2VsLXJ1bnRpbWVdOiBDb25uZWN0ZWQgdG8gSE1SIHNlcnZlciBmb3IgJHtuLmVudHJ5RmlsZVBhdGh9YCl9KSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCgpPT57bShgW3BsYXNtby9wYXJjZWwtcnVudGltZV06IENvbm5lY3Rpb24gdG8gdGhlIEhNUiBzZXJ2ZXIgaXMgY2xvc2VkIGZvciAke24uZW50cnlGaWxlUGF0aH1gKX0pLHR9dmFyIHM9XCJfX3BsYXNtby1sb2FkaW5nX19cIjtmdW5jdGlvbiAkKCl7bGV0IGU9Z2xvYmFsVGhpcy53aW5kb3c/LnRydXN0ZWRUeXBlcztpZih0eXBlb2YgZT5cInVcIilyZXR1cm47bGV0IHQ9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPVwidHJ1c3RlZC10eXBlc1wiXScpPy5jb250ZW50Py5zcGxpdChcIiBcIiksbz10P3RbdD8ubGVuZ3RoLTFdLnJlcGxhY2UoLzsvZyxcIlwiKTp2b2lkIDA7cmV0dXJuIHR5cGVvZiBlPFwidVwiP2UuY3JlYXRlUG9saWN5KG98fGB0cnVzdGVkLWh0bWwtJHtzfWAse2NyZWF0ZUhUTUw6YT0+YX0pOnZvaWQgMH12YXIgVD0kKCk7ZnVuY3Rpb24gZygpe3JldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzKX1mdW5jdGlvbiBmKCl7cmV0dXJuIWcoKX1mdW5jdGlvbiBGKCl7bGV0IGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtlLmlkPXM7bGV0IHQ9YFxuICA8c3R5bGU+XG4gICAgIyR7c30ge1xuICAgICAgYmFja2dyb3VuZDogI2YzZjNmMztcbiAgICAgIGNvbG9yOiAjMzMzO1xuICAgICAgYm9yZGVyOiAxcHggc29saWQgIzMzMztcbiAgICAgIGJveC1zaGFkb3c6ICMzMzMgNC43cHggNC43cHg7XG4gICAgfVxuXG4gICAgIyR7c306aG92ZXIge1xuICAgICAgYmFja2dyb3VuZDogI2UzZTNlMztcbiAgICAgIGNvbG9yOiAjNDQ0O1xuICAgIH1cblxuICAgIEBrZXlmcmFtZXMgcGxhc21vLWxvYWRpbmctYW5pbWF0ZS1zdmctZmlsbCB7XG4gICAgICAwJSB7XG4gICAgICAgIGZpbGw6IHRyYW5zcGFyZW50O1xuICAgICAgfVxuICAgIFxuICAgICAgMTAwJSB7XG4gICAgICAgIGZpbGw6ICMzMzM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgIyR7c30gLnN2Zy1lbGVtLTEge1xuICAgICAgYW5pbWF0aW9uOiBwbGFzbW8tbG9hZGluZy1hbmltYXRlLXN2Zy1maWxsIDEuNDdzIGN1YmljLWJlemllcigwLjQ3LCAwLCAwLjc0NSwgMC43MTUpIDAuOHMgYm90aCBpbmZpbml0ZTtcbiAgICB9XG5cbiAgICAjJHtzfSAuc3ZnLWVsZW0tMiB7XG4gICAgICBhbmltYXRpb246IHBsYXNtby1sb2FkaW5nLWFuaW1hdGUtc3ZnLWZpbGwgMS40N3MgY3ViaWMtYmV6aWVyKDAuNDcsIDAsIDAuNzQ1LCAwLjcxNSkgMC45cyBib3RoIGluZmluaXRlO1xuICAgIH1cbiAgICBcbiAgICAjJHtzfSAuc3ZnLWVsZW0tMyB7XG4gICAgICBhbmltYXRpb246IHBsYXNtby1sb2FkaW5nLWFuaW1hdGUtc3ZnLWZpbGwgMS40N3MgY3ViaWMtYmV6aWVyKDAuNDcsIDAsIDAuNzQ1LCAwLjcxNSkgMXMgYm90aCBpbmZpbml0ZTtcbiAgICB9XG5cbiAgICAjJHtzfSAuaGlkZGVuIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuXG4gIDwvc3R5bGU+XG4gIFxuICA8c3ZnIGhlaWdodD1cIjMyXCIgd2lkdGg9XCIzMlwiIHZpZXdCb3g9XCIwIDAgMjY0IDM1NFwiIGZpbGw9XCJub25lXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICAgIDxwYXRoIGQ9XCJNMTM5LjIyMSAyODIuMjQzQzE1NC4yNTIgMjgyLjI0MyAxNjYuOTAzIDI5NC44NDkgMTYxLjMzOCAzMDguODEyQzE1OS40ODkgMzEzLjQ1NCAxNTcuMTUgMzE3LjkxMyAxNTQuMzQ3IDMyMi4xMDlDMTQ2LjQ2NCAzMzMuOTA5IDEzNS4yNiAzNDMuMTA3IDEyMi4xNTEgMzQ4LjUzOEMxMDkuMDQzIDM1My45NjkgOTQuNjE4MiAzNTUuMzkgODAuNzAyMiAzNTIuNjIxQzY2Ljc4NjEgMzQ5Ljg1MiA1NC4wMDM0IDM0My4wMTggNDMuOTcwNSAzMzIuOTgzQzMzLjkzNzUgMzIyLjk0NyAyNy4xMDUgMzEwLjE2MiAyNC4zMzY5IDI5Ni4yNDJDMjEuNTY4OSAyODIuMzIzIDIyLjk4OTUgMjY3Ljg5NSAyOC40MTkzIDI1NC43ODNDMzMuODQ5MSAyNDEuNjcxIDQzLjA0NDEgMjMwLjQ2NCA1NC44NDE2IDIyMi41NzlDNTkuMDM1MyAyMTkuNzc3IDYzLjQ5MDggMjE3LjQzOCA2OC4xMjk1IDIxNS41ODhDODIuMDkxNSAyMTAuMDIxIDk0LjY5NzggMjIyLjY3MSA5NC42OTc4IDIzNy43MDNMOTQuNjk3OCAyNTUuMDI3Qzk0LjY5NzggMjcwLjA1OCAxMDYuODgzIDI4Mi4yNDMgMTIxLjkxNCAyODIuMjQzSDEzOS4yMjFaXCIgZmlsbD1cIiMzMzNcIiBjbGFzcz1cInN2Zy1lbGVtLTFcIiA+PC9wYXRoPlxuICAgIDxwYXRoIGQ9XCJNMTkyLjI2MSAxNDIuMDI4QzE5Mi4yNjEgMTI2Ljk5NiAyMDQuODY3IDExNC4zNDYgMjE4LjgyOSAxMTkuOTEzQzIyMy40NjggMTIxLjc2MyAyMjcuOTIzIDEyNC4xMDIgMjMyLjExNyAxMjYuOTA0QzI0My45MTUgMTM0Ljc4OSAyNTMuMTEgMTQ1Ljk5NiAyNTguNTM5IDE1OS4xMDhDMjYzLjk2OSAxNzIuMjIgMjY1LjM5IDE4Ni42NDggMjYyLjYyMiAyMDAuNTY3QzI1OS44NTQgMjE0LjQ4NyAyNTMuMDIxIDIyNy4yNzIgMjQyLjk4OCAyMzcuMzA4QzIzMi45NTUgMjQ3LjM0MyAyMjAuMTczIDI1NC4xNzcgMjA2LjI1NiAyNTYuOTQ2QzE5Mi4zNCAyNTkuNzE1IDE3Ny45MTYgMjU4LjI5NCAxNjQuODA3IDI1Mi44NjNDMTUxLjY5OSAyNDcuNDMyIDE0MC40OTUgMjM4LjIzNCAxMzIuNjEyIDIyNi40MzRDMTI5LjgwOCAyMjIuMjM4IDEyNy40NyAyMTcuNzc5IDEyNS42MiAyMTMuMTM3QzEyMC4wNTYgMTk5LjE3NCAxMzIuNzA3IDE4Ni41NjggMTQ3LjczOCAxODYuNTY4TDE2NS4wNDQgMTg2LjU2OEMxODAuMDc2IDE4Ni41NjggMTkyLjI2MSAxNzQuMzgzIDE5Mi4yNjEgMTU5LjM1MkwxOTIuMjYxIDE0Mi4wMjhaXCIgZmlsbD1cIiMzMzNcIiBjbGFzcz1cInN2Zy1lbGVtLTJcIiA+PC9wYXRoPlxuICAgIDxwYXRoIGQ9XCJNOTUuNjUyMiAxNjQuMTM1Qzk1LjY1MjIgMTc5LjE2NyA4My4yMjc5IDE5MS43MjUgNjguODAxMyAxODcuNTA1QzU5LjUxNDUgMTg0Ljc4OCA1MC42NDMyIDE4MC42NjMgNDIuNTEwNiAxNzUuMjI3QzI2Ljc4MDYgMTY0LjcxNCAxNC41MjA2IDE0OS43NzIgNy4yODA4OSAxMzIuMjg5QzAuMDQxMTgzIDExNC44MDcgLTEuODUzMDUgOTUuNTY5NyAxLjgzNzcyIDc3LjAxMDRDNS41Mjg0OSA1OC40NTExIDE0LjYzODUgNDEuNDAzMyAyOC4wMTU3IDI4LjAyMjhDNDEuMzkzIDE0LjY0MjMgNTguNDM2NiA1LjUzMDA2IDc2Ljk5MTQgMS44MzgzOUM5NS41NDYxIC0xLjg1MzI5IDExNC43NzkgMC4wNDE0MTYyIDEzMi4yNTcgNy4yODI5QzE0OS43MzUgMTQuNTI0NCAxNjQuNjc0IDI2Ljc4NzQgMTc1LjE4NCA0Mi41MjEyQzE4MC42MiA1MC42NTc2IDE4NC43NDQgNTkuNTMzMiAxODcuNDYgNjguODI0NUMxOTEuNjc4IDgzLjI1MTkgMTc5LjExOSA5NS42NzU5IDE2NC4wODggOTUuNjc1OUwxMjIuODY5IDk1LjY3NTlDMTA3LjgzNyA5NS42NzU5IDk1LjY1MjIgMTA3Ljg2MSA5NS42NTIyIDEyMi44OTJMOTUuNjUyMiAxNjQuMTM1WlwiIGZpbGw9XCIjMzMzXCIgY2xhc3M9XCJzdmctZWxlbS0zXCI+PC9wYXRoPlxuICA8L3N2Zz5cbiAgPHNwYW4gY2xhc3M9XCJoaWRkZW5cIj5Db250ZXh0IEludmFsaWRhdGVkLCBQcmVzcyB0byBSZWxvYWQ8L3NwYW4+XG4gIGA7cmV0dXJuIGUuaW5uZXJIVE1MPVQ/VC5jcmVhdGVIVE1MKHQpOnQsZS5zdHlsZS5wb2ludGVyRXZlbnRzPVwibm9uZVwiLGUuc3R5bGUucG9zaXRpb249XCJmaXhlZFwiLGUuc3R5bGUuYm90dG9tPVwiMTQuN3B4XCIsZS5zdHlsZS5yaWdodD1cIjE0LjdweFwiLGUuc3R5bGUuZm9udEZhbWlseT1cInNhbnMtc2VyaWZcIixlLnN0eWxlLmRpc3BsYXk9XCJmbGV4XCIsZS5zdHlsZS5qdXN0aWZ5Q29udGVudD1cImNlbnRlclwiLGUuc3R5bGUuYWxpZ25JdGVtcz1cImNlbnRlclwiLGUuc3R5bGUucGFkZGluZz1cIjE0LjdweFwiLGUuc3R5bGUuZ2FwPVwiMTQuN3B4XCIsZS5zdHlsZS5ib3JkZXJSYWRpdXM9XCI0LjdweFwiLGUuc3R5bGUuekluZGV4PVwiMjE0NzQ4MzY0N1wiLGUuc3R5bGUub3BhY2l0eT1cIjBcIixlLnN0eWxlLnRyYW5zaXRpb249XCJhbGwgMC40N3MgZWFzZS1pbi1vdXRcIixlfWZ1bmN0aW9uIE4oZSl7cmV0dXJuIG5ldyBQcm9taXNlKHQ9Pntkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ/KGYoKSYmKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChlKSx0KCkpLHQoKSk6Z2xvYmFsVGhpcy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCgpPT57ZigpJiZkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZSksdCgpfSl9KX12YXIgaz0oKT0+e2xldCBlO2lmKGYoKSl7bGV0IHQ9RigpO2U9Tih0KX1yZXR1cm57c2hvdzphc3luYyh7cmVsb2FkQnV0dG9uOnQ9ITF9PXt9KT0+e2F3YWl0IGU7bGV0IG89ZygpO28uc3R5bGUub3BhY2l0eT1cIjFcIix0JiYoby5vbmNsaWNrPXI9PntyLnN0b3BQcm9wYWdhdGlvbigpLGdsb2JhbFRoaXMubG9jYXRpb24ucmVsb2FkKCl9LG8ucXVlcnlTZWxlY3RvcihcInNwYW5cIikuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKSxvLnN0eWxlLmN1cnNvcj1cInBvaW50ZXJcIixvLnN0eWxlLnBvaW50ZXJFdmVudHM9XCJhbGxcIil9LGhpZGU6YXN5bmMoKT0+e2F3YWl0IGU7bGV0IHQ9ZygpO3Quc3R5bGUub3BhY2l0eT1cIjBcIn19fTt2YXIgVz1gJHtFfSR7bW9kdWxlLmlkfV9fYCxpLEE9ITEsTT1rKCk7YXN5bmMgZnVuY3Rpb24gaCgpe2MoXCJTY3JpcHQgUnVudGltZSAtIHJlbG9hZGluZ1wiKSxBP2dsb2JhbFRoaXMubG9jYXRpb24/LnJlbG9hZD8uKCk6TS5zaG93KHtyZWxvYWRCdXR0b246ITB9KX1mdW5jdGlvbiBSKCl7aT8uZGlzY29ubmVjdCgpLGk9bD8ucnVudGltZS5jb25uZWN0KHtuYW1lOld9KSxpLm9uRGlzY29ubmVjdC5hZGRMaXN0ZW5lcigoKT0+e2goKX0pLGkub25NZXNzYWdlLmFkZExpc3RlbmVyKGU9PntlLl9fcGxhc21vX2NzX3JlbG9hZF9fJiZoKCksZS5fX3BsYXNtb19jc19hY3RpdmVfdGFiX18mJihBPSEwKX0pfWZ1bmN0aW9uIGooKXtpZihsPy5ydW50aW1lKXRyeXtSKCksc2V0SW50ZXJ2YWwoUiwyNGUzKX1jYXRjaHtyZXR1cm59fWooKTtQKGFzeW5jIGU9PntjKFwiU2NyaXB0IHJ1bnRpbWUgLSBvbiB1cGRhdGVkIGFzc2V0c1wiKSxlLmZpbHRlcihvPT5vLmVudkhhc2g9PT1uLmVudkhhc2gpLnNvbWUobz0+TChtb2R1bGUuYnVuZGxlLG8uaWQpKSYmKE0uc2hvdygpLGw/LnJ1bnRpbWU/aS5wb3N0TWVzc2FnZSh7X19wbGFzbW9fY3NfY2hhbmdlZF9fOiEwfSk6c2V0VGltZW91dCgoKT0+e2goKX0sNDcwMCkpfSk7XG4iLCIvKipcbiAqIFBsYXNtbyBDb250ZW50IFNjcmlwdCDigJQgR21haWwgQUkgQXNzaXN0YW50XG4gKlxuICogU2VsZi1jb250YWluZWQ6IE5PIGV4dGVybmFsIGltcG9ydHMuXG4gKiBFdmVudCBkZWxlZ2F0aW9uIHZpYSBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIOKGkiBzdXJ2aXZlcyBhbGwgR21haWwgcmUtcmVuZGVycy5cbiAqIEJ1dHRvbiBpZGVudGlmaWVkIGJ5IHN0YWJsZSBJRCBhdHRyaWJ1dGUuXG4gKi9cblxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IHtcbiAgbWF0Y2hlczogWydodHRwczovL21haWwuZ29vZ2xlLmNvbS8qJ10sXG4gIHJ1bl9hdDogJ2RvY3VtZW50X2lkbGUnLFxufTtcblxuLy8g4pSA4pSA4pSAIENvbmZpZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QgQlVUVE9OX0lEICAgPSAnZ21haWwtYWktcmVwbHktYnRuJztcbmNvbnN0IEJVVFRPTl9BVFRSID0gJ2RhdGEtZ21haWwtYWktYnRuJztcbmNvbnN0IFRPQVNUX0lEICAgID0gJ2dtYWlsLWFpLXRvYXN0JztcbmNvbnN0IEJBQ0tFTkRfVVJMID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCc7XG5cbi8vIOKUgOKUgOKUgCBUb2FzdCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gc2hvd1RvYXN0KG1lc3NhZ2U6IHN0cmluZywgdHlwZTogJ3N1Y2Nlc3MnIHwgJ2Vycm9yJyB8ICdpbmZvJyA9ICdzdWNjZXNzJyk6IHZvaWQge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChUT0FTVF9JRCk/LnJlbW92ZSgpO1xuICBjb25zdCBjb2xvcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7IHN1Y2Nlc3M6ICcjMTZhMzRhJywgZXJyb3I6ICcjZGMyNjI2JywgaW5mbzogJyMyNTYzZWInIH07XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmlkID0gVE9BU1RfSUQ7XG4gIE9iamVjdC5hc3NpZ24oZWwuc3R5bGUsIHtcbiAgICBwb3NpdGlvbjogJ2ZpeGVkJywgYm90dG9tOiAnMjhweCcsIHJpZ2h0OiAnMjhweCcsIHpJbmRleDogJzIxNDc0ODM2NDcnLFxuICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JzW3R5cGVdLCBjb2xvcjogJyNmZmYnLCBwYWRkaW5nOiAnMTJweCAyMHB4JyxcbiAgICBib3JkZXJSYWRpdXM6ICc4cHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiAnNjAwJyxcbiAgICBmb250RmFtaWx5OiAnXCJHb29nbGUgU2Fuc1wiLCBSb2JvdG8sIEFyaWFsLCBzYW5zLXNlcmlmJyxcbiAgICBib3hTaGFkb3c6ICcwIDRweCAyMHB4IHJnYmEoMCwwLDAsMC4zKScsIG1heFdpZHRoOiAnMzYwcHgnLFxuICAgIGxpbmVIZWlnaHQ6ICcxLjQnLCBwb2ludGVyRXZlbnRzOiAnbm9uZScsIG9wYWNpdHk6ICcxJyxcbiAgICB0cmFuc2l0aW9uOiAnb3BhY2l0eSAwLjNzIGVhc2UnLFxuICB9KTtcbiAgZWwudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7IGVsLnN0eWxlLm9wYWNpdHkgPSAnMCc7IHNldFRpbWVvdXQoKCkgPT4gZWwucmVtb3ZlKCksIDM1MCk7IH0sIDQwMDApO1xufVxuXG4vLyDilIDilIDilIAgRW1haWwgRXh0cmFjdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gZ2V0VGhyZWFkSWQoKSB7XG4gIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgY29uc3QgcGFydHMgPSBoYXNoLnJlcGxhY2UoJyMnLCAnJykuc3BsaXQoJy8nKTtcbiAgY29uc3QgaWQgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSA/PyAnJztcbiAgY29uc29sZS5sb2coJ1tHbWFpbCBBSV0gVGhyZWFkIElEOicsIGlkLCAnfCBoYXNoOicsIGhhc2gpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RFbWFpbERhdGEoKSB7XG4gIGNvbnNvbGUubG9nKCdbR21haWwgQUldIEV4dHJhY3RpbmcgZW1haWwgZGF0YS4uLicpO1xuICBjb25zdCBzdWJqZWN0RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoMi5oUCcpID8/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oYSBoMicpO1xuICBjb25zdCBzdWJqZWN0ID0gc3ViamVjdEVsPy50ZXh0Q29udGVudD8udHJpbSgpID8/IGRvY3VtZW50LnRpdGxlLnJlcGxhY2UoL1xccypbLV1cXHMqR21haWwkLywgJycpLnRyaW0oKSA/PyAnKE5vIFN1YmplY3QpJztcbiAgY29uc29sZS5sb2coJ1tHbWFpbCBBSV0gU3ViamVjdDonLCBzdWJqZWN0KTtcbiAgY29uc3Qgc2VuZGVyRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ0RbZW1haWxdJykgPz8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2VtYWlsXVtuYW1lXScpID8/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5nbycpO1xuICBjb25zdCBzZW5kZXIgPSBzZW5kZXJFbD8uZ2V0QXR0cmlidXRlKCduYW1lJykgPz8gc2VuZGVyRWw/LnRleHRDb250ZW50Py50cmltKCkgPz8gJ1Vua25vd24nO1xuICBjb25zdCBzZW5kZXJFbWFpbCA9IHNlbmRlckVsPy5nZXRBdHRyaWJ1dGUoJ2VtYWlsJykgPz8gc2VuZGVyRWw/LmdldEF0dHJpYnV0ZSgnZGF0YS1ob3ZlcmNhcmQtaWQnKSA/PyBzZW5kZXI7XG4gIGNvbnNvbGUubG9nKCdbR21haWwgQUldIFNlbmRlcjonLCBzZW5kZXIsIHNlbmRlckVtYWlsKTtcbiAgY29uc3QgYm9keUVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJy5hM3MuYWlMLCAuYTNzJykpO1xuICBjb25zdCBib2R5RWwgPSBib2R5RWxzW2JvZHlFbHMubGVuZ3RoIC0gMV0gPz8gbnVsbDtcbiAgbGV0IGJvZHkgPSBib2R5RWw/LmlubmVyVGV4dD8udHJpbSgpID8/ICcnO1xuICBib2R5ID0gYm9keS5zcGxpdCgnXFxuJykuZmlsdGVyKChsOiBzdHJpbmcpID0+ICFsLnRyaW0oKS5zdGFydHNXaXRoKCc+JykpLmpvaW4oJ1xcbicpLnRyaW0oKTtcbiAgaWYgKCFib2R5KSBib2R5ID0gYm9keUVsPy50ZXh0Q29udGVudD8udHJpbSgpID8/ICcoTm8gYm9keSknO1xuICBjb25zb2xlLmxvZygnW0dtYWlsIEFJXSBCb2R5IGxlbmd0aDonLCBib2R5Lmxlbmd0aCk7XG4gIGNvbnN0IHRocmVhZElkID0gZ2V0VGhyZWFkSWQoKTtcbiAgcmV0dXJuIHsgc3ViamVjdCwgc2VuZGVyLCBzZW5kZXJFbWFpbCwgYm9keSwgdGhyZWFkSWQgfTtcbn1cblxuLy8g4pSA4pSA4pSAIEJ1dHRvbiBTdGF0ZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gc2V0QnRuKHN0YXRlOiAnbG9hZGluZycgfCAnc3VjY2VzcycgfCAnaWRsZScpOiB2b2lkIHtcbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoQlVUVE9OX0lEKTtcbiAgaWYgKCFidG4pIHJldHVybjtcbiAgYnRuLnNldEF0dHJpYnV0ZSgnZGF0YS1haS1zdGF0ZScsIHN0YXRlKTtcbiAgaWYgKHN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICBidG4uaW5uZXJIVE1MID0gJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjE0cHhcIj7ij7M8L3NwYW4+PHNwYW4+R2VuZXJhdGluZ+KApjwvc3Bhbj4nO1xuICAgIGJ0bi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzE1NTdiMCc7XG4gICAgYnRuLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgYnRuLnN0eWxlLm9wYWNpdHkgPSAnMC44JztcbiAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgYnRuLmlubmVySFRNTCA9ICc8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToxNHB4XCI+4pyFPC9zcGFuPjxzcGFuPkRyYWZ0IENyZWF0ZWQ8L3NwYW4+JztcbiAgICBidG4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMxNmEzNGEnO1xuICAgIGJ0bi5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xuICAgIGJ0bi5zdHlsZS5vcGFjaXR5ID0gJzEnO1xuICB9IGVsc2Uge1xuICAgIGJ0bi5pbm5lckhUTUwgPSAnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MTRweDtsaW5lLWhlaWdodDoxXCI+4pyoPC9zcGFuPjxzcGFuPkFJIFJlcGx5PC9zcGFuPic7XG4gICAgYnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMWE3M2U4JztcbiAgICBidG4uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcbiAgICBidG4uc3R5bGUub3BhY2l0eSA9ICcxJztcbiAgfVxufVxuXG4vLyDilIDilIDilIAgQ2xpY2sgSGFuZGxlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlQ2xpY2soKSB7XG4gIGNvbnNvbGUubG9nKCdbR21haWwgQUldID09PT0gQUkgUmVwbHkgQ0xJQ0tFRCA9PT09Jyk7XG4gIGNvbnNvbGUubG9nKCdbR21haWwgQUldIFVSTDonLCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoQlVUVE9OX0lEKTtcbiAgaWYgKGJ0biAmJiBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLWFpLXN0YXRlJykgPT09ICdsb2FkaW5nJykge1xuICAgIGNvbnNvbGUubG9nKCdbR21haWwgQUldIEFscmVhZHkgZ2VuZXJhdGluZywgc2tpcCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNldEJ0bignbG9hZGluZycpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgZGF0YSA9IGV4dHJhY3RFbWFpbERhdGEoKTtcblxuICAgIGlmICghZGF0YS50aHJlYWRJZCkgdGhyb3cgbmV3IEVycm9yKCdObyB0aHJlYWQgSUQgaW4gVVJMIOKAlCBpcyBhbiBlbWFpbCBvcGVuPycpO1xuICAgIGlmICghZGF0YS5ib2R5IHx8IGRhdGEuYm9keSA9PT0gJyhObyBib2R5KScpIHRocm93IG5ldyBFcnJvcignRW1haWwgYm9keSBub3QgZm91bmQnKTtcblxuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICBzdWJqZWN0OiBkYXRhLnN1YmplY3QsXG4gICAgICBzZW5kZXI6IGRhdGEuc2VuZGVyLFxuICAgICAgc2VuZGVyRW1haWw6IGRhdGEuc2VuZGVyRW1haWwsXG4gICAgICBib2R5OiBkYXRhLmJvZHksXG4gICAgICB0aHJlYWRJZDogZGF0YS50aHJlYWRJZCxcbiAgICB9O1xuXG4gICAgY29uc29sZS5sb2coJ1tHbWFpbCBBSV0gU2VuZGluZyB0byBiYWNrZW5kOicsIEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLnNsaWNlKDAsIDIwMCkpO1xuXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7QkFDS0VORF9VUkx9L2dlbmVyYXRlLWRyYWZ0YCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ1tHbWFpbCBBSV0gUmVzcG9uc2Ugc3RhdHVzOicsIHJlcy5zdGF0dXMpO1xuICAgIGNvbnN0IHRleHQgPSBhd2FpdCByZXMudGV4dCgpO1xuICAgIGNvbnNvbGUubG9nKCdbR21haWwgQUldIFJlc3BvbnNlIGJvZHk6JywgdGV4dC5zbGljZSgwLCAzMDApKTtcblxuICAgIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEJhY2tlbmQgZXJyb3IgJHtyZXMuc3RhdHVzfTogJHt0ZXh0LnNsaWNlKDAsIDE1MCl9YCk7XG5cbiAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICBjb25zb2xlLmxvZygnW0dtYWlsIEFJXSBEcmFmdCBjcmVhdGVkOicsIGpzb24pO1xuXG4gICAgc2V0QnRuKCdzdWNjZXNzJyk7XG4gICAgc2hvd1RvYXN0KCfinIUgQUkgRHJhZnQgQ3JlYXRlZCEgQ2hlY2sgeW91ciBEcmFmdHMgZm9sZGVyLicsICdzdWNjZXNzJyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRCdG4oJ2lkbGUnKSwgNDAwMCk7XG5cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc3QgbXNnID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tHbWFpbCBBSV0gRVJST1I6JywgbXNnKTtcbiAgICBzaG93VG9hc3QoJ+KdjCBGYWlsZWQ6ICcgKyBtc2csICdlcnJvcicpO1xuICAgIHNldEJ0bignaWRsZScpO1xuICB9XG59XG5cbi8vIOKUgOKUgOKUgCBFdmVudCBEZWxlZ2F0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuLy8gQ2FwdHVyZS1waGFzZSBsaXN0ZW5lciBvbiBkb2N1bWVudCDigJQgZmlyZXMgZXZlbiBpZiBHbWFpbCBzdG9wcyBwcm9wYWdhdGlvbi5cbi8vIE1hdGNoZXMgdGhlIGJ1dHRvbiBieSBJRCBvciBCVVRUT05fQVRUUiByZWdhcmRsZXNzIG9mIERPTSByZS1yZW5kZXJzLlxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICBpZiAoIXRhcmdldCkgcmV0dXJuO1xuICBjb25zdCBidG4gPSAodGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbG9zZXN0KCcjJyArIEJVVFRPTl9JRCArICcsIFsnICsgQlVUVE9OX0FUVFIgKyAnXScpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgaWYgKGJ0bikge1xuICAgIGNvbnNvbGUubG9nKCdbR21haWwgQUldIERlbGVnYXRlZCBjbGljayBjYXVnaHQgb24gZG9jdW1lbnQnKTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICBoYW5kbGVDbGljaygpO1xuICB9XG59LCB0cnVlKTtcblxuLy8g4pSA4pSA4pSAIFRvb2xiYXIgRGV0ZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBmaW5kVG9vbGJhcigpIHtcbiAgY29uc3QgZ2hUbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2RpdltnaD1cInRtXCJdJyk7XG4gIGlmIChnaFRtKSB7IGNvbnNvbGUubG9nKCdbR21haWwgQUldIFRvb2xiYXI6IGRpdltnaD1cInRtXCJdJyk7IHJldHVybiBnaFRtOyB9XG5cbiAgZm9yIChjb25zdCB0YiBvZiBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tyb2xlPVwidG9vbGJhclwiXScpKSkge1xuICAgIGlmIChcbiAgICAgIHRiLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRvb2x0aXA9XCJBcmNoaXZlXCJdLFthcmlhLWxhYmVsPVwiQXJjaGl2ZVwiXScpIHx8XG4gICAgICB0Yi5xdWVyeVNlbGVjdG9yKCdbZGF0YS10b29sdGlwPVwiRGVsZXRlXCJdLFthcmlhLWxhYmVsPVwiRGVsZXRlXCJdJylcbiAgICApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdbR21haWwgQUldIFRvb2xiYXI6IHJvbGU9dG9vbGJhcicpO1xuICAgICAgcmV0dXJuIHRiO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3Qgc2VsIG9mIFsnW2RhdGEtdG9vbHRpcD1cIk1vcmVcIl0nLCdbYXJpYS1sYWJlbD1cIk1vcmVcIl0nLCdbZGF0YS10b29sdGlwPVwiTW9yZSBvcHRpb25zXCJdJ10pIHtcbiAgICBjb25zdCBtb3JlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWwpO1xuICAgIGlmICghbW9yZSkgY29udGludWU7XG4gICAgbGV0IG5vZGUgPSBtb3JlLnBhcmVudEVsZW1lbnQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2ICYmIG5vZGU7IGkrKykge1xuICAgICAgaWYgKG5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdG9vbHRpcF0nKS5sZW5ndGggPj0gMykge1xuICAgICAgICBjb25zb2xlLmxvZygnW0dtYWlsIEFJXSBUb29sYmFyOiBNb3JlLWJ1dHRvbiB3YWxrIGRlcHRoJywgaSk7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBhcmNoaXZlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtdG9vbHRpcD1cIkFyY2hpdmVcIl0sW2FyaWEtbGFiZWw9XCJBcmNoaXZlXCJdJyk7XG4gIGlmIChhcmNoaXZlKSB7XG4gICAgbGV0IG5vZGUgPSBhcmNoaXZlLnBhcmVudEVsZW1lbnQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2ICYmIG5vZGU7IGkrKykge1xuICAgICAgaWYgKG5vZGUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdG9vbHRpcF0sW2FyaWEtbGFiZWxdJykubGVuZ3RoID49IDMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tHbWFpbCBBSV0gVG9vbGJhcjogQXJjaGl2ZS1idXR0b24gd2FsayBkZXB0aCcsIGkpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuICB9XG5cbiAgY29uc29sZS53YXJuKCdbR21haWwgQUldIFRvb2xiYXIgTk9UIGZvdW5kJyk7XG4gIHJldHVybiBudWxsO1xufVxuXG4vLyDilIDilIDilIAgSW5qZWN0aW9uIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBpc0VtYWlsT3BlbigpIHtcbiAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICBpZiAoIWhhc2guaW5jbHVkZXMoJy8nKSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBpZCA9IGhhc2guc3BsaXQoJy8nKS5wb3AoKSA/PyAnJztcbiAgcmV0dXJuIGlkLmxlbmd0aCA+PSA4ICYmIC9eW2EtekEtWjAtOV8tXSskLy50ZXN0KGlkKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQnV0dG9uKCkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChCVVRUT05fSUQpPy5yZW1vdmUoKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRCdXR0b24oKSB7XG4gIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBidG4uaWQgPSBCVVRUT05fSUQ7XG4gIGJ0bi5zZXRBdHRyaWJ1dGUoQlVUVE9OX0FUVFIsICd0cnVlJyk7XG4gIGJ0bi5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnYnV0dG9uJyk7XG4gIGJ0bi5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzAnKTtcbiAgYnRuLnNldEF0dHJpYnV0ZSgnZGF0YS1haS1zdGF0ZScsICdpZGxlJyk7XG4gIGJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnQUkgUmVwbHknKTtcbiAgT2JqZWN0LmFzc2lnbihidG4uc3R5bGUsIHtcbiAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuICAgIGdhcDogJzVweCcsIHBhZGRpbmc6ICcwIDE0cHgnLCBoZWlnaHQ6ICczMnB4JywgYm9yZGVyUmFkaXVzOiAnNHB4JyxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMWE3M2U4JywgY29sb3I6ICcjZmZmZmZmJywgZm9udFNpemU6ICcxM3B4JyxcbiAgICBmb250V2VpZ2h0OiAnNjAwJywgZm9udEZhbWlseTogJ1wiR29vZ2xlIFNhbnNcIixSb2JvdG8sQXJpYWwsc2Fucy1zZXJpZicsXG4gICAgY3Vyc29yOiAncG9pbnRlcicsIG1hcmdpbkxlZnQ6ICc4cHgnLCB1c2VyU2VsZWN0OiAnbm9uZScsIGZsZXhTaHJpbms6ICcwJyxcbiAgICB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZC1jb2xvciAwLjE1cyBlYXNlJywgYm94U2hhZG93OiAnMCAxcHggM3B4IHJnYmEoMCwwLDAsMC4yKScsXG4gICAgcG9pbnRlckV2ZW50czogJ2F1dG8nLCBwb3NpdGlvbjogJ3JlbGF0aXZlJywgekluZGV4OiAnOScsXG4gIH0pO1xuICBidG4uaW5uZXJIVE1MID0gJzxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjE0cHg7bGluZS1oZWlnaHQ6MVwiPuKcqDwvc3Bhbj48c3Bhbj5BSSBSZXBseTwvc3Bhbj4nO1xuXG4gIC8vIERpcmVjdCBsaXN0ZW5lciAoYmFja3VwIHRvIGRlbGVnYXRpb24pXG4gIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zb2xlLmxvZygnW0dtYWlsIEFJXSBEaXJlY3QgY2xpY2sgb24gYnV0dG9uJyk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgaGFuZGxlQ2xpY2soKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7IGlmIChidG4uZ2V0QXR0cmlidXRlKCdkYXRhLWFpLXN0YXRlJykgPT09ICdpZGxlJykgYnRuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMTU1N2IwJzsgfSk7XG4gIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4geyBpZiAoYnRuLmdldEF0dHJpYnV0ZSgnZGF0YS1haS1zdGF0ZScpID09PSAnaWRsZScpIGJ0bi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzFhNzNlOCc7IH0pO1xuICBidG4uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiB7IGlmIChlLmtleSA9PT0gJ0VudGVyJyB8fCBlLmtleSA9PT0gJyAnKSB7IGUucHJldmVudERlZmF1bHQoKTsgaGFuZGxlQ2xpY2soKTsgfSB9KTtcblxuICByZXR1cm4gYnRuO1xufVxuXG5mdW5jdGlvbiB0cnlJbmplY3QoKSB7XG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChCVVRUT05fSUQpKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKCFpc0VtYWlsT3BlbigpKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHRvb2xiYXIgPSBmaW5kVG9vbGJhcigpO1xuICBpZiAoIXRvb2xiYXIpIHJldHVybiBmYWxzZTtcbiAgY29uc3QgYnRuID0gYnVpbGRCdXR0b24oKTtcbiAgY29uc3QgbW9yZSA9IHRvb2xiYXIucXVlcnlTZWxlY3RvcignW2RhdGEtdG9vbHRpcD1cIk1vcmVcIl0sW2FyaWEtbGFiZWw9XCJNb3JlXCJdLFtkYXRhLXRvb2x0aXA9XCJNb3JlIG9wdGlvbnNcIl0nKTtcbiAgaWYgKG1vcmUpIHsgbW9yZS5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgYnRuKTsgY29uc29sZS5sb2coJ1tHbWFpbCBBSV0g4pyFIEluamVjdGVkIGFmdGVyIE1vcmUnKTsgfVxuICBlbHNlICAgICAgIHsgdG9vbGJhci5hcHBlbmRDaGlsZChidG4pOyAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0dtYWlsIEFJXSDinIUgSW5qZWN0ZWQgYXQgZW5kIG9mIHRvb2xiYXInKTsgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8g4pSA4pSA4pSAIEJvb3RzdHJhcCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxubGV0IGRlYm91bmNlVGltZXI6IFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgbnVsbCA9IG51bGw7XG5sZXQgbGFzdFVybCA9IGxvY2F0aW9uLmhyZWY7XG5cbmZ1bmN0aW9uIHNjaGVkdWxlSW5qZWN0KG1zID0gNDAwKSB7XG4gIGlmIChkZWJvdW5jZVRpbWVyKSBjbGVhclRpbWVvdXQoZGVib3VuY2VUaW1lcik7XG4gIGRlYm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBpZiAoIXRyeUluamVjdCgpKSB7XG4gICAgICBzZXRUaW1lb3V0KHRyeUluamVjdCwgNjAwKTtcbiAgICAgIHNldFRpbWVvdXQodHJ5SW5qZWN0LCAxNTAwKTtcbiAgICAgIHNldFRpbWVvdXQodHJ5SW5qZWN0LCAzMDAwKTtcbiAgICB9XG4gIH0sIG1zKTtcbn1cblxuZnVuY3Rpb24gb25VcmxDaGFuZ2UoKSB7XG4gIGlmIChsb2NhdGlvbi5ocmVmID09PSBsYXN0VXJsKSByZXR1cm47XG4gIGxhc3RVcmwgPSBsb2NhdGlvbi5ocmVmO1xuICBjb25zb2xlLmxvZygnW0dtYWlsIEFJXSBVUkwgY2hhbmdlZDonLCBsb2NhdGlvbi5ocmVmKTtcbiAgcmVtb3ZlQnV0dG9uKCk7XG4gIHNjaGVkdWxlSW5qZWN0KDM1MCk7XG59XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcCgpIHtcbiAgY29uc29sZS5sb2coJ1tHbWFpbCBBSV0gQ29udGVudCBzY3JpcHQgYm9vdHN0cmFwcGVkIHwgVVJMOicsIGxvY2F0aW9uLmhyZWYpO1xuICB0cnlJbmplY3QoKTtcbiAgc2NoZWR1bGVJbmplY3QoNTAwKTtcbiAgc2V0VGltZW91dCh0cnlJbmplY3QsIDEyMDApO1xuICBzZXRUaW1lb3V0KHRyeUluamVjdCwgMjUwMCk7XG4gIHNldFRpbWVvdXQodHJ5SW5qZWN0LCA1MDAwKTtcblxuICBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgb25VcmxDaGFuZ2UoKTtcbiAgICBpZiAoaXNFbWFpbE9wZW4oKSAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoQlVUVE9OX0lEKSkgc2NoZWR1bGVJbmplY3QoMjUwKTtcbiAgfSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsICgpID0+IHsgY29uc29sZS5sb2coJ1tHbWFpbCBBSV0gaGFzaGNoYW5nZTonLCBsb2NhdGlvbi5oYXNoKTsgcmVtb3ZlQnV0dG9uKCk7IHNjaGVkdWxlSW5qZWN0KDM1MCk7IH0pO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCAgICgpID0+IHsgcmVtb3ZlQnV0dG9uKCk7IHNjaGVkdWxlSW5qZWN0KDM1MCk7IH0pO1xufVxuXG5pZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBib290c3RyYXApO1xufSBlbHNlIHtcbiAgYm9vdHN0cmFwKCk7XG59XG4iLCJleHBvcnRzLmludGVyb3BEZWZhdWx0ID0gZnVuY3Rpb24gKGEpIHtcbiAgcmV0dXJuIGEgJiYgYS5fX2VzTW9kdWxlID8gYSA6IHtkZWZhdWx0OiBhfTtcbn07XG5cbmV4cG9ydHMuZGVmaW5lSW50ZXJvcEZsYWcgPSBmdW5jdGlvbiAoYSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYSwgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbn07XG5cbmV4cG9ydHMuZXhwb3J0QWxsID0gZnVuY3Rpb24gKHNvdXJjZSwgZGVzdCkge1xuICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChrZXkgPT09ICdkZWZhdWx0JyB8fCBrZXkgPT09ICdfX2VzTW9kdWxlJyB8fCBkZXN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwga2V5LCB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2Vba2V5XTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBkZXN0O1xufTtcblxuZXhwb3J0cy5leHBvcnQgPSBmdW5jdGlvbiAoZGVzdCwgZGVzdE5hbWUsIGdldCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVzdCwgZGVzdE5hbWUsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZ2V0LFxuICB9KTtcbn07XG4iXSwibmFtZXMiOltdLCJ2ZXJzaW9uIjozLCJmaWxlIjoiZ21haWwuYTdlNzY4NmIuanMubWFwIn0=
 globalThis.define=__define;  })(globalThis.define);