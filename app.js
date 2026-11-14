"use strict";
const KEY = "jarif-rate-v1";
const UNITS = ["প্রতি এস এফ টি", "প্রতি আর এফ টি", "প্রতি পিচ"];
const FONT = '"Noto Sans Bengali","Kalpurush","SolaimanLipi","Bangla Sangam MN","Nirmala UI",system-ui,sans-serif';

const DEFAULTS = {
  info: {
    bismillah: "বিসমিল্লাহির রহমানির রাহীম",
    title: "জারিফ এন্টারপ্রাইজ",
    owner: "প্রোপাইটর- হাবিবুর রহমান (রাহাত)",
    tagline: "এখানে সুদক্ষ কারিগর দ্বারা টাইলস, মোজাইক, মার্বেল এবং গ্রানাইট সিরামিক্সও পুরাতন মোজাইক ঘষানো ইত্যাদি কাজ যত্নসহকারে করা হয়।",
    address: "কাটাসুর, রহিম ব্যাপারির ঘাট, ২০/ঘ, মোহাম্মদপুর, ঢাকা-১২০৭।",
    mobile: "০১৯৫৭-৯১৭৩০৪",
    heading: "কাজের রেট",
    note: "বি: দ্র: এই আইটেমের বাহিরে অন্য কোন কাজ থাকিলে তাহা বর্তমান বাজার দর অনুযায়ী দিতে হবে। প্রতি তলা এভাবে ১০%, সমস্ত মালামাল মালিকের থাকিবে। কাজ চলাকালিন প্রতি মিস্ত্রি ও লেবার ২০০০/-(দুই হাজার) টাকা করে দিতে হবে।",
    sigL: "মালিক পক্ষের স্বাক্ষর",
    sigR: "ঠিকাদারের স্বাক্ষর",
    ref: "",
    date: ""
  },
  rows: [
    ["ওয়াল টাইলস্", 0, 20], ["ফ্লোর টাইলস্", 0, 20], ["স্কাটিং", 1, 20],
    ["ডুরসিল", 2, 300], ["টাইলস্ জানালা বারান্দার টপ ও রাউন এবং বডার", 1, 20],
    ["মার্বেল গ্রানেইট", 0, 100], ["মার্বেল মর্লিং", 1, 80], ["থাইবিড", 2, 600],
    ["বেচিন", 2, 500], ["সিঁড়ি ও স্কাটিং", 1, 30], ["চোকি ও লিফটের ওয়াল", 0, 30],
    ["সিরামিক্স", 0, 100], ["রূপটালী", 0, 80], ["গ্যারেজ টাইল্স", 0, 30]
  ].map(([name, u, price]) => ({ name, unit: UNITS[u], price: String(price) }))
};

let state = load();
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.info && Array.isArray(s.rows)) return { info: { ...DEFAULTS.info, ...s.info }, rows: s.rows };
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULTS));
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

const $ = (s) => document.querySelector(s);
const bn = (v) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const en = (v) => String(v).replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- Rates editor ---------- */
function renderRows() {
  const box = $("#rows"); box.innerHTML = "";
  state.rows.forEach((r, i) => {
    const el = document.createElement("div"); el.className = "row";
    const units = UNITS.includes(r.unit) ? UNITS : [...UNITS, r.unit];
    el.innerHTML = `
      <div class="top2">
        <span class="no">${bn(i + 1)}</span>
        <input class="name" value="" placeholder="কাজের বিবরণ">
        <button class="ic" data-a="up" aria-label="উপরে">▲</button>
        <button class="ic" data-a="down" aria-label="নিচে">▼</button>
        <button class="ic del" data-a="del" aria-label="মুছুন">✕</button>
      </div>
      <div class="bot">
        <select class="unit">${units.map((u) => `<option>${u}</option>`).join("")}</select>
        <span class="tk">৳</span>
        <input class="price" inputmode="decimal" placeholder="দর">
      </div>`;
    const name = el.querySelector(".name"), unit = el.querySelector(".unit"), price = el.querySelector(".price");
    name.value = r.name; unit.value = r.unit; price.value = bn(r.price);
    name.oninput = () => { r.name = name.value; changed(); };
    unit.onchange = () => { r.unit = unit.value; changed(); };
    price.oninput = () => { r.price = en(price.value).replace(/[^\d.]/g, ""); changed(); };
    el.onclick = (e) => {
      const a = e.target.dataset && e.target.dataset.a; if (!a) return;
      if (a === "del") { if (!confirm("এই কাজটি মুছবেন?")) return; state.rows.splice(i, 1); }
      if (a === "up" && i > 0) [state.rows[i - 1], state.rows[i]] = [state.rows[i], state.rows[i - 1]];
      if (a === "down" && i < state.rows.length - 1) [state.rows[i + 1], state.rows[i]] = [state.rows[i], state.rows[i + 1]];
      changed(); renderRows();
    };
    box.appendChild(el);
  });
}
$("#addRow").onclick = () => {
  state.rows.push({ name: "", unit: UNITS[0], price: "" }); changed(); renderRows();
  const n = document.querySelectorAll(".row .name"); n[n.length - 1].focus();
};

/* ---------- Info form ---------- */
const FIELDS = ["bismillah", "title", "owner", "tagline", "address", "mobile", "heading", "note", "sigL", "sigR", "ref", "date"];
function bindInfo() {
  FIELDS.forEach((k) => {
    const el = $("#f-" + k); el.value = state.info[k] || "";
    el.oninput = () => { state.info[k] = el.value; changed(); };
  });
}
$("#todayBtn").onclick = () => {
  const d = new Date();
  state.info.date = bn(`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`);
  $("#f-date").value = state.info.date; changed();
};

/* ---------- Canvas rendering ---------- */
const W = 1080, PAD = 60;
function wrap(ctx, text, maxW) {
  const lines = [];
  String(text).split("\n").forEach((para) => {
    let line = "";
    para.split(/(\s+)/).forEach((tok) => {
      if (ctx.measureText(line + tok).width > maxW && line.trim()) { lines.push(line.trim()); line = tok.trimStart(); }
      else line += tok;
    });
    lines.push(line.trim());
  });
  return lines;
}
function draw() {
  const c = $("#canvas"), ctx = c.getContext("2d"), i = state.info;
  const S = 2; // supersample for crisp text
  // pass 1: measure layout with a scratch height, pass 2: draw
  c.width = W * S; c.height = 4000 * S; ctx.setTransform(S, 0, 0, S, 0, 0);
  const H = layout(ctx, i, false);
  c.width = W * S; c.height = H * S; ctx.setTransform(S, 0, 0, S, 0, 0);
  layout(ctx, i, true);
}
function layout(ctx, i, paint) {
  const ink = "#111", f = (px, w = "") => (ctx.font = `${w} ${px}px ${FONT}`.trim());
  if (paint) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, 4000); }
  ctx.fillStyle = ink; ctx.textBaseline = "alphabetic";
  let y = 70;
  const center = (t, px, w, gap) => {
    f(px, w); ctx.textAlign = "center";
    wrap(ctx, t, W - PAD * 2).forEach((l) => { y += gap; if (paint) ctx.fillText(l, W / 2, y); });
  };
  if (i.bismillah) center(i.bismillah, 24, "", 0);
  y += 20; center(i.title, 76, "bold", 56);
  if (i.owner) center(i.owner, 28, "", 50);
  if (i.tagline) center(i.tagline, 24, "", 42);
  if (i.address) center(i.address, 24, "", 38);
  if (i.mobile) center("মোবাইল নং- " + i.mobile, 26, "bold", 40);
  y += 28;
  if (paint) { ctx.fillRect(PAD, y, W - PAD * 2, 2); }
  y += 44; f(24); ctx.textAlign = "left";
  if (paint) { ctx.fillText("সূত্র: " + (i.ref || ""), PAD, y); ctx.textAlign = "right"; ctx.fillText("তারিখ: " + (i.date || ""), W - PAD, y); }
  y += 56; f(34, "bold"); ctx.textAlign = "center";
  if (paint) {
    ctx.fillText(i.heading, W / 2, y);
    const w = ctx.measureText(i.heading).width; ctx.fillRect(W / 2 - w / 2, y + 7, w, 3);
  }
  y += 28;

  // table
  const x0 = PAD, tw = W - PAD * 2, cols = [70, 0, 190, 120]; cols[1] = tw - cols[0] - cols[2] - cols[3];
  const xs = [x0]; cols.forEach((w) => xs.push(xs[xs.length - 1] + w));
  const rowH = 52;
  const cell = (t, ci, ry, bold, align) => {
    f(26, bold ? "bold" : ""); ctx.textAlign = align;
    const x = align === "center" ? xs[ci] + cols[ci] / 2 : align === "right" ? xs[ci + 1] - 14 : xs[ci] + 14;
    ctx.fillText(t, x, ry);
  };
  const drawRow = (cells, bold) => {
    f(26, bold ? "bold" : "");
    const nameLines = wrap(ctx, cells[1], cols[1] - 28);
    const h = Math.max(rowH, nameLines.length * 36 + 16);
    if (paint) {
      ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y, tw, h);
      xs.slice(1, -1).forEach((x) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke(); });
      if (bold) { ctx.fillStyle = "#eef1ee"; ctx.fillRect(x0 + 1, y + 1, tw - 2, h - 2); ctx.fillStyle = ink; ctx.strokeRect(x0, y, tw, h); xs.slice(1, -1).forEach((x) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke(); }); }
      const base = y + h / 2 + 9;
      cell(cells[0], 0, base, bold, "center");
      f(26, bold ? "bold" : ""); ctx.textAlign = bold ? "center" : "left";
      nameLines.forEach((l, k) => ctx.fillText(l, bold ? xs[1] + cols[1] / 2 : xs[1] + 14, y + h / 2 + 9 - ((nameLines.length - 1) * 36) / 2 + k * 36));
      cell(cells[2], 2, base, bold, "center");
      cell(cells[3], 3, base, bold, "center");
    }
    y += h;
  };
  drawRow(["ক্র/নং", "কাজের বিবরণ", "পরিমান", "টাকা"], true);
  state.rows.forEach((r, k) => drawRow([bn(String(k + 1).padStart(2, "0")), r.name, r.unit, bn(r.price)], false));

  // note
  y += 20; f(22); ctx.textAlign = "left";
  wrap(ctx, i.note || "", tw).forEach((l) => { y += 34; if (paint) ctx.fillText(l, x0, y); });
  // signatures
  y += 130;
  if (paint) {
    f(22); ctx.textAlign = "left"; ctx.fillText(i.sigL || "", PAD, y);
    ctx.textAlign = "right"; ctx.fillText(i.sigR || "", W - PAD, y);
    ctx.fillRect(PAD, y - 30, 260, 1.5); ctx.fillRect(W - PAD - 260, y - 30, 260, 1.5);
  }
  return y + 50;
}

/* ---------- Output ---------- */
function toBlob() { return new Promise((res) => $("#canvas").toBlob(res, "image/png")); }
function fileName() { return "jarif-rate-" + new Date().toISOString().slice(0, 10) + ".png"; }
function download(blob) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = fileName();
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function plainText() {
  const i = state.info;
  const lines = [`*${i.title}*`, i.owner, i.mobile ? "মোবাইল: " + i.mobile : "", "", `*${i.heading}*`];
  if (i.ref) lines.push("সূত্র: " + i.ref);
  if (i.date) lines.push("তারিখ: " + i.date);
  lines.push("");
  state.rows.forEach((r, k) => lines.push(`${bn(k + 1)}. ${r.name} — ${r.unit} ${bn(r.price)} টাকা`));
  lines.push("", i.note);
  return lines.filter((l, k, a) => l !== "" || a[k - 1] !== "").join("\n");
}
$("#shareBtn").onclick = async () => {
  draw(); const blob = await toBlob();
  const file = new File([blob], fileName(), { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: state.info.title }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  download(blob); toast("ছবি সেভ হয়েছে — WhatsApp-এ গিয়ে অ্যাটাচ করুন");
  window.open("https://wa.me/", "_blank");
};
$("#saveBtn").onclick = async () => { draw(); download(await toBlob()); toast("ছবি সেভ হয়েছে"); };
$("#textBtn").onclick = () => window.open("https://wa.me/?text=" + encodeURIComponent(plainText()), "_blank");

/* ---------- Backup ---------- */
$("#exportBtn").onclick = () => download2(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }), "jarif-backup.json");
function download2(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); }
$("#importBtn").onclick = () => $("#importFile").click();
$("#importFile").onchange = async (e) => {
  try {
    const s = JSON.parse(await e.target.files[0].text());
    if (!s.info || !Array.isArray(s.rows)) throw 0;
    state = { info: { ...DEFAULTS.info, ...s.info }, rows: s.rows }; save(); init(); toast("ব্যাকআপ লোড হয়েছে");
  } catch (_) { toast("ফাইলটি সঠিক নয়"); }
};
$("#resetBtn").onclick = () => { if (confirm("সব তথ্য আগের অবস্থায় ফিরবে। নিশ্চিত?")) { state = JSON.parse(JSON.stringify(DEFAULTS)); save(); init(); } };

/* ---------- Tabs / init ---------- */
let timer;
function changed() { save(); clearTimeout(timer); timer = setTimeout(() => { if ($("#tab-preview").classList.contains("active")) draw(); }, 150); }
document.querySelectorAll(".tabs button").forEach((b) => (b.onclick = () => {
  document.querySelectorAll(".tabs button,.tab").forEach((x) => x.classList.remove("active"));
  b.classList.add("active"); $("#tab-" + b.dataset.tab).classList.add("active");
  if (b.dataset.tab === "preview") draw();
  window.scrollTo(0, 0);
}));
function init() { renderRows(); bindInfo(); }
init();
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {});

if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
