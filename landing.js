"use strict";
const bn = (v) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const en = (v) => String(v).replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));
const $ = (s) => document.querySelector(s);
const UNIT_WORD = { "প্রতি এস এফ টি": "বর্গফুট", "প্রতি আর এফ টি": "রানিং ফুট", "প্রতি পিচ": "পিচ" };
let rows = [];

fetch("rates.json").then((r) => r.json()).then((d) => {
  rows = d.rows; $("#upd").textContent = d.updated;
  $("#rateList").innerHTML = rows.map((r) => `<div class="r"><div>${r.name}<small>${r.unit}</small></div><b>৳ ${bn(r.price)}</b></div>`).join("");
  $("#cWork").innerHTML = rows.map((r, i) => `<option value="${i}">${r.name}</option>`).join("");
  calc();
}).catch(() => { $("#rateList").innerHTML = '<p class="sub" style="padding:14px">রেট লোড করা যায়নি। অনুগ্রহ করে কল করে জেনে নিন।</p>'; });

function calc() {
  const r = rows[+$("#cWork").value]; if (!r) return;
  const qty = parseFloat(en($("#cQty").value)) || 0, total = qty * r.price, w = UNIT_WORD[r.unit] || "পরিমাণ";
  $("#cLbl").textContent = `কত ${w}?`;
  $("#cTotal").textContent = "৳ " + bn(Math.round(total).toLocaleString("en-US"));
  const msg = `আসসালামু আলাইকুম, ${r.name} কাজের আনুমানিক হিসাব: ${bn(qty)} ${w} × ${bn(r.price)} = ${bn(Math.round(total))} টাকা। কাজটি নিয়ে কথা বলতে চাই।`;
  $("#cSend").href = "https://wa.me/8801957917304?text=" + encodeURIComponent(msg);
}
$("#cWork").onchange = calc; $("#cQty").oninput = calc;

if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
