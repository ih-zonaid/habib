"use strict";
const KEY = "jarif-rate-v1";
const UNITS = ["প্রতি এস এফ টি", "প্রতি আর এফ টি", "প্রতি পিচ"];
const UNIT_LABEL = { "প্রতি এস এফ টি": "বর্গফুট (এস এফ টি)", "প্রতি আর এফ টি": "রানিং ফুট (আর এফ টি)", "প্রতি পিচ": "পিচ" };
const FONT = '"Tiro Bangla","Noto Sans Bengali","Kalpurush","SolaimanLipi","Bangla Sangam MN","Nirmala UI",system-ui,sans-serif';

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
    sigR: "ঠিকাদারের স্বাক্ষর"
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
const num = (v) => parseFloat(en(v)) || 0;

/* client fields are per-sheet (not saved) so an old name is never sent by mistake */
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const session = { ref: "", dateISO: todayISO() };
const dateStr = () => { const [y, m, d] = session.dateISO.split("-"); return d ? bn(`${d}/${m}/${y}`) : ""; };
const sheetInfo = () => ({ ...state.info, ref: session.ref, date: dateStr() });

/* ---------- UI helpers ---------- */
function toast(msg, actLabel, act) {
  const t = $("#toast"), b = $("#toastAct");
  $("#toastMsg").textContent = msg;
  b.hidden = !actLabel; b.textContent = actLabel || ""; b.onclick = () => { t.classList.remove("show"); act && act(); };
  t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), actLabel ? 6000 : 2800);
}
function openSheet(id) { $(id).classList.add("open"); document.body.classList.add("lock"); }
function closeSheets() { document.querySelectorAll(".sheet.open,.screen.open").forEach((e) => e.classList.remove("open")); document.body.classList.remove("lock"); }
document.querySelectorAll(".sheet").forEach((s) => {
  s.addEventListener("click", (e) => { if (e.target === s) closeSheets(); });
  s.querySelectorAll("[data-close]").forEach((b) => (b.onclick = closeSheets));
});

/* ---------- Step 1: client ---------- */
$("#ref").oninput = (e) => (session.ref = e.target.value);
$("#date").value = session.dateISO;
$("#date").onchange = (e) => (session.dateISO = e.target.value || todayISO());

/* ---------- Step 2: list ---------- */
function renderList() {
  const box = $("#list"); box.innerHTML = "";
  state.rows.forEach((r, i) => {
    const b = document.createElement("button"); b.className = "item";
    b.innerHTML = `<span class="no"></span><span class="meta"><b></b><small></small></span><span class="price"></span><span class="chev">›</span>`;
    b.querySelector(".no").textContent = bn(i + 1);
    b.querySelector("b").textContent = r.name || "(নাম নেই)";
    b.querySelector("small").textContent = r.unit;
    const p = b.querySelector(".price");
    if (r.price === "" || r.price == null) { p.textContent = "দাম দিন"; p.classList.add("empty"); } else p.textContent = "৳ " + bn(r.price);
    b.onclick = () => editRow(i);
    box.appendChild(b);
  });
}

/* edit sheet works on a draft; nothing changes until "সেভ করুন" */
let draft = null, draftIdx = -1;
function editRow(i) {
  draftIdx = i;
  draft = i >= 0 ? { ...state.rows[i] } : { name: "", unit: UNITS[0], price: "" };
  $("#editTitle").textContent = i >= 0 ? `${bn(i + 1)}. কাজ সম্পাদনা` : "নতুন কাজ";
  $("#eName").value = draft.name; $("#ePrice").value = bn(draft.price);
  $("#eTools").style.display = i >= 0 ? "grid" : "none";
  $("#eUp").disabled = i <= 0; $("#eDown").disabled = i < 0 || i >= state.rows.length - 1;
  renderUnits(); openSheet("#sheetEdit");
  if (i < 0) setTimeout(() => $("#eName").focus(), 250);
}
function renderUnits() {
  const box = $("#eUnits"); box.innerHTML = "";
  const all = UNITS.includes(draft.unit) ? UNITS : [...UNITS, draft.unit];
  all.forEach((u) => {
    const c = document.createElement("button"); c.className = "chip" + (u === draft.unit ? " on" : "");
    c.textContent = UNIT_LABEL[u] || u; c.onclick = () => { draft.unit = u; renderUnits(); };
    box.appendChild(c);
  });
}
$("#eName").oninput = (e) => (draft.name = e.target.value);
$("#ePrice").oninput = (e) => (draft.price = en(e.target.value).replace(/[^\d.]/g, ""));
const step = () => (num(draft.price) >= 100 ? 10 : 5);
$("#ePlus").onclick = () => { draft.price = String(num(draft.price) + step()); $("#ePrice").value = bn(draft.price); };
$("#eMinus").onclick = () => { draft.price = String(Math.max(0, num(draft.price) - step())); $("#ePrice").value = bn(draft.price); };
$("#eSave").onclick = () => {
  if (!draft.name.trim()) return toast("কাজের নাম লিখুন");
  if (draft.price === "") return toast("দাম লিখুন");
  draft.name = draft.name.trim();
  if (draftIdx >= 0) state.rows[draftIdx] = draft; else state.rows.push(draft);
  save(); renderList(); closeSheets(); toast("সেভ হয়েছে ✓");
};
function move(d) {
  const i = draftIdx, j = i + d; if (j < 0 || j >= state.rows.length) return;
  [state.rows[i], state.rows[j]] = [state.rows[j], state.rows[i]]; save(); renderList(); editRow(j);
}
$("#eUp").onclick = () => move(-1); $("#eDown").onclick = () => move(1);
$("#eDel").onclick = () => {
  const [gone] = state.rows.splice(draftIdx, 1), at = draftIdx;
  save(); renderList(); closeSheets();
  toast("মুছে ফেলা হয়েছে", "ফিরিয়ে আনুন", () => { state.rows.splice(at, 0, gone); save(); renderList(); });
};
$("#addBtn").onclick = () => editRow(-1);

/* bulk % change with undo */
$("#bulkBtn").onclick = () => { $("#bPct").value = ""; openSheet("#sheetBulk"); };
function bulk(sign) {
  const p = num($("#bPct").value); if (!p) return toast("শতাংশ লিখুন");
  const before = JSON.stringify(state.rows);
  state.rows.forEach((r) => { const v = num(r.price) * (1 + (sign * p) / 100); r.price = String(Math.max(0, Math.round(v / 5) * 5)); });
  save(); renderList(); closeSheets();
  toast(`সব দাম ${bn(p)}% ${sign > 0 ? "বাড়ানো" : "কমানো"} হয়েছে`, "আগের অবস্থায়", () => { state.rows = JSON.parse(before); save(); renderList(); });
}
$("#bUp").onclick = () => bulk(1); $("#bDown").onclick = () => bulk(-1);

/* ---------- Settings ---------- */
const FIELDS = ["bismillah", "title", "owner", "tagline", "address", "mobile", "heading", "note", "sigL", "sigR"];
FIELDS.forEach((k) => { const el = $("#s-" + k); el.value = state.info[k] || ""; el.oninput = () => { state.info[k] = el.value; save(); }; });
$("#menuBtn").onclick = () => openSheet("#sheetSet");
let deferred = null;
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
if (!standalone) {
  $("#installBox").hidden = false;
  $("#installText").textContent = isiOS
    ? "Safari-তে নিচের শেয়ার বাটন (⬆️) চেপে “Add to Home Screen” বাছুন।"
    : "ইনস্টল করলে ফোনের হোম স্ক্রিন থেকে অ্যাপের মতো খুলবে, ইন্টারনেট ছাড়াও চলবে।";
}
addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; $("#installBtn").hidden = false; });
$("#installBtn").onclick = async () => { if (deferred) { deferred.prompt(); deferred = null; $("#installBtn").hidden = true; } };

function saveFile(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
$("#exportBtn").onclick = () => { saveFile(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }), "jarif-backup.json"); toast("ব্যাকআপ সেভ হয়েছে"); };
$("#importBtn").onclick = () => $("#importFile").click();
$("#importFile").onchange = async (e) => {
  try {
    const s = JSON.parse(await e.target.files[0].text());
    if (!s.info || !Array.isArray(s.rows)) throw 0;
    state = { info: { ...DEFAULTS.info, ...s.info }, rows: s.rows }; save(); location.reload();
  } catch (_) { toast("ফাইলটি সঠিক নয়"); }
};
$("#resetBtn").onclick = () => { if (confirm("সব রেট ও তথ্য আগের অবস্থায় ফিরে যাবে। নিশ্চিত?")) { state = JSON.parse(JSON.stringify(DEFAULTS)); save(); location.reload(); } };

/* ---------- Step 3: preview & send ---------- */
$("#previewBtn").onclick = async () => {
  if (!session.ref.trim() && !confirm("ক্লায়েন্টের নাম লেখা হয়নি। নাম ছাড়াই দেখবেন?")) { $("#ref").focus(); return; }
  // canvas text needs the font loaded first, otherwise it falls back silently
  try { await Promise.all([document.fonts.load('26px "Tiro Bangla"'), document.fonts.load('bold 26px "Tiro Bangla"')]); } catch (e) {}
  draw(); $("#screenPrev").classList.add("open"); document.body.classList.add("lock");
};
$("#backBtn").onclick = closeSheets;

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
  const c = $("#canvas"), ctx = c.getContext("2d"), i = sheetInfo(), S = 2;
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
  if (paint) ctx.fillRect(PAD, y, W - PAD * 2, 2);
  y += 44; f(24); ctx.textAlign = "left";
  if (paint) { ctx.fillText("সূত্র: " + (i.ref || ""), PAD, y); ctx.textAlign = "right"; ctx.fillText("তারিখ: " + (i.date || ""), W - PAD, y); }
  y += 56; f(34, "bold"); ctx.textAlign = "center";
  if (paint) { ctx.fillText(i.heading, W / 2, y); const w = ctx.measureText(i.heading).width; ctx.fillRect(W / 2 - w / 2, y + 7, w, 3); }
  y += 28;

  const x0 = PAD, tw = W - PAD * 2, cols = [70, 0, 190, 120]; cols[1] = tw - cols[0] - cols[2] - cols[3];
  const xs = [x0]; cols.forEach((w) => xs.push(xs[xs.length - 1] + w));
  const rowH = 52;
  const grid = (h) => { ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0, y, tw, h); xs.slice(1, -1).forEach((x) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke(); }); };
  const drawRow = (cells, bold) => {
    f(26, bold ? "bold" : "");
    const nameLines = wrap(ctx, cells[1], cols[1] - 28);
    const h = Math.max(rowH, nameLines.length * 36 + 16);
    if (paint) {
      if (bold) { ctx.fillStyle = "#eef1ee"; ctx.fillRect(x0, y, tw, h); ctx.fillStyle = ink; }
      grid(h);
      const base = y + h / 2 + 9;
      f(26, bold ? "bold" : ""); ctx.textAlign = "center";
      ctx.fillText(cells[0], xs[0] + cols[0] / 2, base);
      ctx.fillText(cells[2], xs[2] + cols[2] / 2, base);
      ctx.fillText(cells[3], xs[3] + cols[3] / 2, base);
      ctx.textAlign = bold ? "center" : "left";
      nameLines.forEach((l, k) => ctx.fillText(l, bold ? xs[1] + cols[1] / 2 : xs[1] + 14, base - ((nameLines.length - 1) * 36) / 2 + k * 36));
    }
    y += h;
  };
  drawRow(["ক্র/নং", "কাজের বিবরণ", "পরিমান", "টাকা"], true);
  state.rows.forEach((r, k) => drawRow([bn(String(k + 1).padStart(2, "0")), r.name, r.unit, bn(r.price)], false));

  y += 20; f(22); ctx.textAlign = "left";
  wrap(ctx, i.note || "", tw).forEach((l) => { y += 34; if (paint) ctx.fillText(l, x0, y); });
  y += 130;
  if (paint) {
    f(22); ctx.textAlign = "left"; ctx.fillText(i.sigL || "", PAD, y);
    ctx.textAlign = "right"; ctx.fillText(i.sigR || "", W - PAD, y);
    ctx.fillRect(PAD, y - 30, 260, 1.5); ctx.fillRect(W - PAD - 260, y - 30, 260, 1.5);
  }
  return y + 50;
}

const toBlob = () => new Promise((res) => $("#canvas").toBlob(res, "image/png"));
const fileName = () => "jarif-rate-" + session.dateISO + ".png";
$("#shareBtn").onclick = async () => {
  const blob = await toBlob(), file = new File([blob], fileName(), { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: state.info.title }); return; }
    catch (e) { if (e.name === "AbortError") return; }
  }
  saveFile(blob, fileName()); toast("ছবি সেভ হয়েছে। WhatsApp-এ গিয়ে ছবিটি পাঠান");
  setTimeout(() => window.open("https://wa.me/", "_blank"), 800);
};
$("#saveBtn").onclick = async () => { saveFile(await toBlob(), fileName()); toast("ছবি সেভ হয়েছে ✓"); };

renderList();
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("../sw.js").catch(() => {}));
