// Electrico front end: talks to the Express API (MongoDB) with fetch.
const $ = (id) => document.getElementById(id);
let reports = [];
let editingId = null;

async function api(path, options) {
  const res = await fetch("/api/reports" + path, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Request failed"); }
  return res.status === 204 ? null : res.json();
}
async function load() {                       // READ
  try { reports = await api(""); } catch (e) { $("msg").textContent = "Could not load reports."; }
  render();
}
function toInput(iso) {                       // ISO date -> datetime-local value
  const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
const hourLabel = (h) => (h % 12 || 12) + (h < 12 ? " AM" : " PM");

function drawChart(container, counts, highlight) {
  const max = Math.max(...counts, 1), top = counts.indexOf(Math.max(...counts));
  container.innerHTML = "";
  counts.forEach((v, i) => {
    const bar = document.createElement("div");
    bar.style.height = (v / max) * 100 + "%";
    bar.title = v + (v === 1 ? " report" : " reports");
    if (highlight && v > 0 && i === top) bar.className = "top";
    container.appendChild(bar);
  });
}

function render() {
  const hours = Array(24).fill(0), days = Array(7).fill(0), lengths = [];
  reports.forEach((r) => {
    const d = new Date(r.time); hours[d.getHours()]++; days[d.getDay()]++;
    if (r.mins) lengths.push(r.mins);
  });
  const total = reports.length, enough = total >= 5;
  drawChart($("hoursChart"), hours, enough);
  drawChart($("daysChart"), days, enough);
  const dayNames = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
  if (enough) {
    const h = hours.indexOf(Math.max(...hours)), d = days.indexOf(Math.max(...days));
    $("nowHead").textContent = "Most likely: around " + hourLabel(h) + " to " + hourLabel((h + 1) % 24);
    $("nowSub").textContent = hours[h] + " of " + total + " reports began in this hour. Busiest day: " + dayNames[d] + ".";
  } else {
    $("nowHead").textContent = total ? "Not enough reports yet" : "No reports yet";
    $("nowSub").textContent = "Electrico needs at least 5 reports to estimate a pattern. " + total + " so far.";
  }
  $("avg").textContent = lengths.length
    ? "Average reported length: " + Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) + " minutes." : "";

  const filter = $("filter").value;
  const shown = reports.filter((r) => filter === "all" || r.muni === filter).slice(0, 15);
  const list = $("list"); list.innerHTML = "";
  if (!shown.length) { const li = document.createElement("li"); li.textContent = "No reports to show."; list.appendChild(li); }
  shown.forEach((r) => {
    const li = document.createElement("li"), place = document.createElement("span"),
          when = document.createElement("small"), btns = document.createElement("span");
    place.textContent = r.brgy + ", " + r.muni;
    when.textContent = new Date(r.time).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) +
      (r.mins ? " - " + r.mins + " min" : "");
    btns.className = "row-btns";
    const edit = document.createElement("button"), del = document.createElement("button");
    edit.textContent = "Edit"; del.textContent = "Delete"; edit.className = del.className = "btn-ghost";
    edit.addEventListener("click", () => startEdit(r));
    del.addEventListener("click", async () => {                 // DELETE
      if (!confirm("Delete this report?")) return;
      try { await api("/" + r._id, { method: "DELETE" }); } catch (e) { alert(e.message); }
      load();
    });
    btns.append(edit, del); li.append(place, when, btns); list.appendChild(li);
  });
}

function resetForm() {
  editingId = null; $("reportForm").reset(); $("start").value = toInput(new Date());
  $("submitBtn").textContent = "Submit report"; $("cancelBtn").hidden = true;
}
function startEdit(r) {                       // fill the form for UPDATE
  editingId = r._id;
  $("muni").value = r.muni; $("brgy").value = r.brgy; $("start").value = toInput(r.time); $("mins").value = r.mins || "";
  $("submitBtn").textContent = "Save changes"; $("cancelBtn").hidden = false;
  $("msg").textContent = "Editing a report."; $("report").scrollIntoView({ behavior: "smooth" });
}

$("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = JSON.stringify({ muni: $("muni").value, brgy: $("brgy").value.trim(),
    time: new Date($("start").value).toISOString(), mins: Number($("mins").value) || 0 });
  try {
    if (editingId) await api("/" + editingId, { method: "PUT", body });   // UPDATE
    else await api("", { method: "POST", body });                         // CREATE
    $("msg").textContent = editingId ? "Report updated." : "Report submitted. Thank you.";
    resetForm(); load();
  } catch (err) { $("msg").textContent = err.message; }
});
$("cancelBtn").addEventListener("click", () => { resetForm(); $("msg").textContent = ""; });
$("filter").addEventListener("change", render);

resetForm();
load();
