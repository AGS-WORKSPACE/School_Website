import { writeFile, mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "public", "images", "placeholders");

const NAVY = "#0b1f3a";
const NAVY_LIGHT = "#123158";
const MEDICAL = "#0057a8";
const MEDICAL_LIGHT = "#2f7fc4";
const GOLD = "#c8a24a";
const GOLD_LIGHT = "#e0c47c";
const INK = "#e8ecf3";

const W = 1200;
const H = 800;

const LABELS = {
  "hero-campus": { kind: "photo", query: "university campus building", theme: "campus", minWidth: 1200 },
  "hero-students": { kind: "photo", query: "university students campus", theme: "students", minWidth: 1200 },
  "faculty-medicine": { kind: "photo", query: "medical school building", theme: "medicine" },
  "faculty-dentistry": { kind: "photo", query: "dental clinic chair", theme: "dentistry" },
  "faculty-nursing": { kind: "photo", query: "nurse with stethoscope", theme: "nursing" },
  "faculty-pharmacy": { kind: "photo", query: "pharmacy medicine bottles", theme: "pharmacy" },
  "faculty-public-health": { kind: "photo", query: "public health community workers", theme: "publichealth" },
  "faculty-biomedical": { kind: "photo", query: "biomedical research laboratory", theme: "biomedical" },
  "campus-library": { kind: "photo", query: "university library reading room interior", theme: "library" },
  "simulation-lab": { kind: "photo", query: "medical simulation training", theme: "simulation" },
  "lecture-theatre": { kind: "photo", query: "university lecture hall auditorium seats", theme: "lecture" },
  "student-hostel": { kind: "photo", query: "student dormitory residence building", theme: "hostel" },
  "sports-complex": { kind: "photo", query: "athletics running track stadium", theme: "sports" },
  cafeteria: { kind: "photo", query: "cafeteria dining hall", theme: "cafeteria" },
  "research-lab": { kind: "photo", query: "research laboratory microscope scientist", theme: "research" },
  "news-1": { kind: "photo", query: "medical simulation training centre", theme: "simulation" },
  "news-2": { kind: "photo", query: "malaria research laboratory", theme: "field" },
  "news-3": { kind: "photo", query: "graduation ceremony", theme: "graduation" },
  "event-conference": { kind: "photo", query: "conference audience", theme: "conference" },
  "event-graduation": { kind: "photo", query: "graduation caps", theme: "graduation" },
  "event-orientation": { kind: "photo", query: "university students orientation", theme: "orientation" },
  "clinical-trial": { kind: "photo", query: "test tubes laboratory", theme: "trial" },
  "innovation-center": { kind: "photo", query: "science laboratory technology", theme: "innovation" },

  "vice-chancellor": { kind: "portrait" },
  provost: { kind: "portrait" },
  "dean-medicine": { kind: "portrait" },
  "board-chair": { kind: "portrait" },
  "student-1": { kind: "portrait" },
  "student-2": { kind: "portrait" },
  "student-3": { kind: "portrait" },
};

/* ---------------------------------- helpers ---------------------------------- */

function initialsOf(label) {
  return label
    .split(/[-\s]+/)
    .filter((word) => word.length > 1)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function chip() {
  const mono = "TAU";
  return `<g transform="translate(24 24)">
    <rect x="0" y="0" width="88" height="34" rx="17" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.28)"/>
    <text x="44" y="22" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" letter-spacing="2" fill="${GOLD_LIGHT}">${mono}</text>
  </g>`;
}

function skyGrad(id = "sky") {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY_LIGHT}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient>`;
}

function sky() {
  return `<defs>${skyGrad()}<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GOLD_LIGHT}"/><stop offset="1" stop-color="${GOLD}"/></linearGradient><linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${MEDICAL}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient><linearGradient id="blob" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${MEDICAL_LIGHT}" stop-opacity="0.55"/><stop offset="1" stop-color="${MEDICAL}" stop-opacity="0.1"/></linearGradient></defs>`;
}

function ground(y = 560) {
  return `<path d="M0 ${y} H1200 V800 H0 Z" fill="url(#grass)"/>
    <path d="M0 ${y + 6} H1200" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="2"/>`;
}

function building(x, y, w, h, color, roof = false) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color}"/>
    ${roof ? `<path d="M${x - 8} ${y} L${x + w / 2} ${y - 46} L${x + w + 8} ${y} Z" fill="${NAVY_LIGHT}" opacity="0.9"/>` : ""}`;
}

function windows(x, y, cols, rows, w, gap = 18) {
  let out = "";
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cx = x + c * (w + gap);
      const cy = y + r * (w + gap);
      out += `<rect x="${cx}" y="${cy}" width="${w}" height="${w}" rx="3" fill="${GOLD_LIGHT}" opacity="${r % 2 ? 0.5 : 0.85}"/>`;
    }
  }
  return out;
}

function tree(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-7" y="0" width="14" height="70" rx="5" fill="${NAVY_LIGHT}"/>
    <circle cx="0" cy="-40" r="46" fill="${MEDICAL}" opacity="0.9"/>
    <circle cx="-28" cy="-18" r="30" fill="${MEDICAL_LIGHT}" opacity="0.7"/>
    <circle cx="30" cy="-22" r="32" fill="${MEDICAL}" opacity="0.85"/>
  </g>`;
}

function person(x, y, s = 1, color = "rgba(255,255,255,0.5)") {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="-58" r="26" fill="${color}"/>
    <path d="M-34 -6 C-34 -52 -46 -46 -30 -18 C-44 -30 -38 4 -44 34 C-44 56 44 56 44 34 C50 4 44 -30 30 -18 C46 -46 34 -52 34 -6 Z" fill="${color}"/>
  </g>`;
}

function sun(x = 980, y = 130) {
  return `<circle cx="${x}" cy="${y}" r="86" fill="url(#sun)" opacity="0.95"/>
    <circle cx="${x}" cy="${y}" r="118" fill="${GOLD}" opacity="0.12"/>`;
}

/* ------------------------------ scene templates ------------------------------ */

const scenes = {
  campus() {
    return `${sky()}${ground(600)}${sun()}
      ${building(120, 300, 260, 300, MEDICAL, true)}${windows(150, 380, 3, 3, 26)}
      ${building(420, 360, 220, 240, NAVY_LIGHT, true)}${windows(444, 430, 3, 2, 26)}
      ${building(680, 260, 280, 340, MEDICAL_LIGHT, true)}${windows(716, 350, 4, 3, 26)}
      ${tree(80, 560, 1.1)}${tree(990, 570, 0.9)}${tree(1080, 555, 1.2)}
      <path d="M120 610 C340 560 520 620 760 595 C900 585 1000 600 1140 600" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="3" fill="none"/>
      ${person(360, 640, 0.8)}${person(420, 645, 0.9)}${person(480, 638, 0.8)}
      ${chip()}`;
  },
  students() {
    return `${sky()}${ground(560)}${sun(1010, 130)}
      ${building(150, 340, 300, 220, MEDICAL_LIGHT, true)}${windows(184, 400, 3, 2, 26)}
      ${building(760, 300, 300, 260, NAVY_LIGHT, true)}${windows(792, 360, 3, 2, 26)}
      ${tree(80, 520, 1)}${tree(1080, 520, 1.05)}
      ${person(420, 620, 1)}${person(470, 610, 1.05)}${person(522, 622, 1)}${person(574, 608, 1.05)}${person(626, 618, 0.98)}
      ${person(680, 624, 0.95)}
      <path d="M360 700 H820" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="2"/>
      ${chip()}`;
  },
  medicine() {
    return `${sky()}${ground(620)}
      <circle cx="600" cy="300" r="180" fill="url(#blob)"/>
      <g transform="translate(600 300)">
        <circle cx="0" cy="0" r="96" fill="${GOLD}" opacity="0.15"/>
        <path d="M0 -70 C40 -70 70 -40 70 0 C70 40 40 70 0 70 C-40 70 -70 40 -70 0 C-70 -40 -40 -70 0 -70 Z" fill="${GOLD_LIGHT}" opacity="0.9"/>
        <path d="M0 -70 C-30 -30 -30 30 0 70 M0 -70 C30 -30 30 30 0 70" stroke="${NAVY}" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.9"/>
        <circle cx="0" cy="0" r="22" fill="${NAVY}"/>
      </g>
      <g transform="translate(340 470)"><rect x="-50" y="-6" width="100" height="12" rx="6" fill="${MEDICAL_LIGHT}" opacity="0.7"/><rect x="-36" y="10" width="72" height="10" rx="5" fill="${MEDICAL}" opacity="0.5"/></g>
      <g transform="translate(870 470)"><rect x="-50" y="-6" width="100" height="12" rx="6" fill="${MEDICAL_LIGHT}" opacity="0.7"/><rect x="-36" y="10" width="72" height="10" rx="5" fill="${MEDICAL}" opacity="0.5"/></g>
      ${chip()}`;
  },
  dentistry() {
    return `${sky()}${ground(640)}
      <g transform="translate(600 340)">
        <path d="M0 -110 C70 -110 130 -60 130 10 C130 70 90 110 40 90 C20 80 12 60 0 40 C-12 60 -20 80 -40 90 C-90 110 -130 70 -130 10 C-130 -60 -70 -110 0 -110 Z" fill="${INK}"/>
        <path d="M0 -110 L0 40 M-130 10 L130 10" stroke="${MEDICAL}" stroke-width="8" opacity="0.55"/>
      </g>
      <g transform="translate(230 500)"><rect x="-60" y="-8" width="120" height="14" rx="7" fill="${GOLD_LIGHT}" opacity="0.9"/></g>
      <g transform="translate(970 500)"><rect x="-60" y="-8" width="120" height="14" rx="7" fill="${GOLD_LIGHT}" opacity="0.9"/></g>
      ${chip()}`;
  },
  nursing() {
    return `${sky()}${ground(620)}
      <g transform="translate(600 330)">
        <circle cx="0" cy="-110" r="64" fill="${INK}"/>
        <path d="M-150 -30 C-120 -120 -150 -150 -60 -120 C-110 -180 110 -180 60 -120 C150 -150 120 -120 150 -30 C160 60 -160 60 -150 -30 Z" fill="${INK}"/>
        <path d="M0 -190 L0 -120 M-36 -156 L36 -156" stroke="${MEDICAL}" stroke-width="14" stroke-linecap="round"/>
        <circle cx="0" cy="-66" r="10" fill="${NAVY}"/>
      </g>
      <path d="M180 640 C380 610 820 610 1020 640" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="3" fill="none"/>
      ${chip()}`;
  },
  pharmacy() {
    return `${sky()}${ground(660)}
      <g transform="translate(600 340)">
        <path d="M-60 -80 L60 -80 L50 110 L-50 110 Z" fill="${MEDICAL_LIGHT}"/>
        <rect x="-44" y="-56" width="88" height="130" rx="8" fill="${NAVY}"/>
        <path d="M0 -56 L0 74 M-20 -56 L-20 74 M20 -56 L20 74 M-44 0 L44 0" stroke="${GOLD_LIGHT}" stroke-width="6"/>
        <rect x="-16" y="-150" width="32" height="60" rx="4" fill="${MEDICAL}"/>
        <circle cx="0" cy="-158" r="22" fill="${GOLD}"/>
        <circle cx="-96" cy="140" r="34" fill="${GOLD_LIGHT}" opacity="0.9"/>
        <rect x="-20" y="150" width="40" height="10" rx="5" fill="${NAVY}"/>
      </g>
      <circle cx="270" cy="250" r="18" fill="${MEDICAL_LIGHT}" opacity="0.7"/><circle cx="310" cy="210" r="14" fill="${GOLD}" opacity="0.7"/>
      <circle cx="930" cy="250" r="18" fill="${MEDICAL_LIGHT}" opacity="0.7"/><circle cx="890" cy="210" r="14" fill="${GOLD}" opacity="0.7"/>
      ${chip()}`;
  },
  publichealth() {
    return `${sky()}${ground(600)}${sun(1030, 130)}
      <g transform="translate(600 330)">
        <path d="M0 -140 L110 -95 V10 C110 110 60 170 0 190 C-60 170 -110 110 -110 10 V-95 Z" fill="${INK}" opacity="0.96"/>
        <path d="M0 -140 L110 -95 V10 C110 110 60 170 0 190 C-60 170 -110 110 -110 10 V-95 Z" fill="none" stroke="${GOLD}" stroke-width="8"/>
        <path d="M0 -80 V50 M-48 0 H48" stroke="${MEDICAL}" stroke-width="16" stroke-linecap="round"/>
        <path d="M-30 150 C-10 120 10 120 30 150 C50 180 10 210 0 190" stroke="${MEDICAL_LIGHT}" stroke-width="12" fill="none" stroke-linecap="round"/>
      </g>
      ${person(260, 600, 0.7)}${person(330, 595, 0.75)}${person(870, 595, 0.75)}${person(940, 600, 0.7)}
      ${chip()}`;
  },
  biomedical() {
    return `${sky()}${ground(650)}
      <g transform="translate(600 340)">
        <path d="M0 -130 C60 -130 60 -60 0 -60 C-60 -60 -60 10 0 10 C60 10 60 80 0 80 C-60 80 -60 130 0 130" fill="none" stroke="${GOLD_LIGHT}" stroke-width="16" stroke-linecap="round"/>
        <circle cx="0" cy="-130" r="16" fill="${INK}"/><circle cx="0" cy="-60" r="16" fill="${INK}"/><circle cx="0" cy="10" r="16" fill="${INK}"/><circle cx="0" cy="80" r="16" fill="${INK}"/><circle cx="0" cy="130" r="16" fill="${INK}"/>
        <path d="M-30 -60 L30 -100 M-30 10 L30 -30 M-30 80 L30 40" stroke="${MEDICAL_LIGHT}" stroke-width="10" stroke-linecap="round"/>
        <path d="M-30 -130 L30 -90 M-30 -60 L30 -20 M-30 10 L30 50 M-30 80 L30 120" stroke="${MEDICAL}" stroke-width="10" stroke-linecap="round"/>
      </g>
      <circle cx="250" cy="230" r="26" fill="${MEDICAL_LIGHT}" opacity="0.6"/><circle cx="290" cy="180" r="16" fill="${GOLD}" opacity="0.6"/>
      <circle cx="950" cy="230" r="26" fill="${MEDICAL_LIGHT}" opacity="0.6"/><circle cx="910" cy="180" r="16" fill="${GOLD}" opacity="0.6"/>
      ${chip()}`;
  },
  library() {
    return `<defs>${skyGrad()}<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY_LIGHT}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient></defs>
      <rect width="1200" height="800" fill="url(#floor)"/>
      <path d="M0 520 H1200" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="3"/>
      <rect x="120" y="140" width="200" height="380" rx="6" fill="${NAVY_LIGHT}"/>
      ${windows(140, 160, 4, 8, 34, 14)}
      <rect x="380" y="140" width="200" height="380" rx="6" fill="${NAVY_LIGHT}"/>
      ${windows(400, 160, 4, 8, 34, 14)}
      <rect x="820" y="140" width="200" height="380" rx="6" fill="${NAVY_LIGHT}"/>
      ${windows(840, 160, 4, 8, 34, 14)}
      <g transform="translate(700 500)">
        <rect x="-60" y="-26" width="120" height="150" rx="8" fill="${MEDICAL}"/>
        <path d="M0 -26 L0 124 M-30 -26 L-30 124 M30 -26 L30 124 M-60 40 L60 40 M-60 90 L60 90" stroke="${GOLD_LIGHT}" stroke-width="5"/>
      </g>
      ${person(700, 660, 0.9)}
      <g transform="translate(240 560)"><rect x="-70" y="-12" width="140" height="20" rx="10" fill="${MEDICAL_LIGHT}" opacity="0.7"/></g>
      ${chip()}`;
  },
  simulation() {
    return `${sky()}${ground(600)}
      <rect x="200" y="180" width="800" height="380" rx="16" fill="${NAVY_LIGHT}" stroke="${INK}" stroke-opacity="0.12" stroke-width="3"/>
      <rect x="200" y="560" width="800" height="40" rx="8" fill="${NAVY}"/>
      <g transform="translate(600 330)">
        <rect x="-90" y="40" width="180" height="140" rx="14" fill="${INK}"/>
        <rect x="-90" y="40" width="180" height="44" rx="14" fill="${GOLD_LIGHT}"/>
        <circle cx="0" cy="24" r="40" fill="${INK}"/>
        <circle cx="0" cy="10" r="12" fill="${NAVY}"/>
        <rect x="-34" y="60" width="68" height="16" rx="8" fill="${MEDICAL}"/>
        <path d="M-60 160 L-60 200 L60 200 L60 160" fill="${MEDICAL_LIGHT}"/>
      </g>
      <g transform="translate(300 500)"><rect x="-40" y="-6" width="80" height="12" rx="6" fill="${MEDICAL}" opacity="0.6"/></g>
      <g transform="translate(900 500)"><rect x="-40" y="-6" width="80" height="12" rx="6" fill="${MEDICAL}" opacity="0.6"/></g>
      ${chip()}`;
  },
  lecture() {
    return `${sky()}${ground(560)}
      <rect x="200" y="120" width="800" height="330" rx="10" fill="${NAVY_LIGHT}" stroke="${INK}" stroke-opacity="0.15" stroke-width="3"/>
      <rect x="340" y="160" width="520" height="250" rx="6" fill="${MEDICAL}"/>
      <rect x="340" y="160" width="520" height="250" rx="6" fill="${GOLD}" opacity="0.25"/>
      <path d="M400 200 L520 280 L640 200 L760 280 L880 200" stroke="${INK}" stroke-opacity="0.5" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${person(260, 620, 0.8)}${person(320, 615, 0.85)}${person(600, 612, 0.85)}${person(660, 620, 0.8)}${person(940, 612, 0.85)}${person(1000, 620, 0.8)}
      <g transform="translate(460 540)"><rect x="-60" y="0" width="120" height="120" rx="6" fill="${MEDICAL_LIGHT}"/><rect x="-40" y="120" width="80" height="26" rx="4" fill="${NAVY_LIGHT}"/></g>
      ${chip()}`;
  },
  hostel() {
    return `${sky()}${ground(590)}${sun(1000, 120)}
      ${building(260, 240, 300, 350, MEDICAL_LIGHT, true)}${windows(296, 320, 4, 4, 26)}
      ${building(620, 200, 300, 390, NAVY_LIGHT, true)}${windows(656, 280, 4, 4, 26)}
      <g transform="translate(760 150)"><rect x="-16" y="0" width="32" height="46" rx="4" fill="${GOLD}"/></g>
      ${tree(120, 550, 1)}${tree(1060, 540, 1.1)}
      <path d="M380 610 C520 590 720 590 860 610" stroke="${GOLD}" stroke-opacity="0.45" stroke-width="3" fill="none"/>
      ${person(520, 650, 0.8)}${person(580, 645, 0.85)}
      ${chip()}`;
  },
  sports() {
    return `${sky()}${ground(470)}
      <rect x="140" y="430" width="920" height="370" rx="24" fill="${MEDICAL}"/>
      <path d="M200 430 V800" stroke="${INK}" stroke-opacity="0.8" stroke-width="6"/>
      <path d="M1000 430 V800" stroke="${INK}" stroke-opacity="0.8" stroke-width="6"/>
      <path d="M400 430 C430 560 430 670 400 800 M800 430 C770 560 770 670 800 800" stroke="${INK}" stroke-opacity="0.8" stroke-width="6" fill="none"/>
      <g transform="translate(600 610)"><ellipse cx="0" cy="0" rx="130" ry="44" fill="none" stroke="${GOLD_LIGHT}" stroke-width="8"/><rect x="-3" y="-44" width="6" height="88" fill="${GOLD_LIGHT}"/></g>
      <circle cx="600" cy="610" r="26" fill="${INK}"/>
      ${person(300, 660, 0.7, "rgba(255,255,255,0.6)")}${person(840, 660, 0.7, "rgba(255,255,255,0.6)")}
      ${chip()}`;
  },
  cafeteria() {
    return `${sky()}${ground(600)}
      <rect x="240" y="160" width="720" height="360" rx="16" fill="${NAVY_LIGHT}" stroke="${INK}" stroke-opacity="0.12" stroke-width="3"/>
      <g transform="translate(430 460)">
        <rect x="-110" y="-18" width="220" height="36" rx="18" fill="${MEDICAL}"/>
        <ellipse cx="-70" cy="-18" rx="26" ry="10" fill="${INK}" opacity="0.9"/><ellipse cx="10" cy="-18" rx="26" ry="10" fill="${GOLD_LIGHT}" opacity="0.9"/><ellipse cx="82" cy="-18" rx="26" ry="10" fill="${MEDICAL_LIGHT}" opacity="0.9"/>
      </g>
      <g transform="translate(720 460)">
        <rect x="-110" y="-18" width="220" height="36" rx="18" fill="${MEDICAL}"/>
        <ellipse cx="-70" cy="-18" rx="26" ry="10" fill="${INK}" opacity="0.9"/><ellipse cx="10" cy="-18" rx="26" ry="10" fill="${GOLD_LIGHT}" opacity="0.9"/><ellipse cx="82" cy="-18" rx="26" ry="10" fill="${MEDICAL_LIGHT}" opacity="0.9"/>
      </g>
      ${person(430, 560, 0.7)}${person(720, 560, 0.7)}
      <g transform="translate(600 200)"><rect x="-90" y="0" width="180" height="26" rx="13" fill="${GOLD}" opacity="0.5"/></g>
      ${chip()}`;
  },
  research() {
    return `${sky()}${ground(640)}
      <g transform="translate(600 360)">
        <circle cx="0" cy="-40" r="100" fill="${INK}" opacity="0.06"/>
        <rect x="-60" y="40" width="120" height="140" rx="8" fill="${INK}"/>
        <rect x="-60" y="40" width="120" height="34" rx="8" fill="${MEDICAL_LIGHT}"/>
        <path d="M-60 74 H60" stroke="${NAVY}" stroke-width="5"/>
        <circle cx="0" cy="8" r="20" fill="${GOLD}"/>
        <path d="M-30 40 V90 H30 V40" stroke="${NAVY}" stroke-width="6" fill="none"/>
        <path d="M-90 40 L-90 -120 C-90 -160 -10 -160 -10 -120 V40 M10 40 V-20 C10 -70 80 -70 80 -20 V40" fill="none" stroke="${MEDICAL_LIGHT}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="-90" cy="-120" r="12" fill="${GOLD_LIGHT}"/><circle cx="80" cy="-20" r="12" fill="${GOLD_LIGHT}"/>
      </g>
      <path d="M120 660 H1080" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="2"/>
      ${chip()}`;
  },
  field() {
    return `${sky()}${ground(560)}${sun(1010, 120)}
      ${tree(140, 540, 1)}${tree(250, 545, 0.85)}${tree(1040, 535, 1.05)}
      <path d="M0 600 H1200 V800 H0 Z" fill="${MEDICAL}" opacity="0.35"/>
      <g transform="translate(600 430)">
        <circle cx="-70" cy="70" r="60" fill="${MEDICAL_LIGHT}" opacity="0.7"/>
        <circle cx="70" cy="70" r="48" fill="${MEDICAL_LIGHT}" opacity="0.7"/>
        <path d="M-90 -40 C-40 -90 60 -90 110 -30 L120 70 L-120 70 Z" fill="${INK}" opacity="0.95"/>
        <path d="M-90 -40 L120 70 M110 -30 L-120 70" stroke="${MEDICAL}" stroke-width="8"/>
        <rect x="-140" y="-170" width="72" height="100" rx="10" fill="${GOLD}"/>
        <circle cx="-104" cy="-130" r="10" fill="${NAVY}"/>
      </g>
      ${person(300, 620, 0.75)}${person(880, 620, 0.75)}
      ${chip()}`;
  },
  graduation() {
    return `${sky()}${ground(600)}${sun(1000, 130)}
      ${building(180, 320, 260, 240, MEDICAL_LIGHT, true)}${windows(210, 380, 3, 2, 26)}
      ${building(760, 300, 260, 260, NAVY_LIGHT, true)}${windows(790, 360, 3, 2, 26)}
      ${person(420, 640, 0.9)}${person(480, 630, 1)}${person(540, 645, 0.9)}${person(600, 635, 1)}${person(660, 648, 0.88)}
      <g transform="translate(540 560)"><path d="M0 -26 L40 0 L0 26 L-40 0 Z" fill="${NAVY}"/><path d="M-40 0 L-40 44" stroke="${NAVY}" stroke-width="5"/><rect x="-6" y="-34" width="12" height="10" rx="3" fill="${GOLD}"/></g>
      <g transform="translate(600 548)"><path d="M0 -26 L40 0 L0 26 L-40 0 Z" fill="${NAVY}"/><path d="M-40 0 L-40 44" stroke="${NAVY}" stroke-width="5"/><rect x="-6" y="-34" width="12" height="10" rx="3" fill="${GOLD}"/></g>
      <g transform="translate(660 558)"><path d="M0 -26 L40 0 L0 26 L-40 0 Z" fill="${NAVY}"/><path d="M-40 0 L-40 44" stroke="${NAVY}" stroke-width="5"/><rect x="-6" y="-34" width="12" height="10" rx="3" fill="${GOLD}"/></g>
      <g transform="translate(430 540) rotate(-18)"><circle cx="0" cy="0" r="8" fill="${GOLD}"/><circle cx="0" cy="10" r="8" fill="${GOLD_LIGHT}"/><circle cx="10" cy="6" r="8" fill="${GOLD}"/></g>
      ${chip()}`;
  },
  conference() {
    return `${sky()}${ground(560)}
      <rect x="200" y="150" width="800" height="300" rx="12" fill="${NAVY_LIGHT}" stroke="${INK}" stroke-opacity="0.12" stroke-width="3"/>
      <rect x="480" y="200" width="240" height="200" rx="8" fill="${MEDICAL}"/>
      <g transform="translate(600 300)"><path d="M0 -60 L110 -40 V60 L0 80 L-110 60 V-40 Z" fill="${GOLD}" opacity="0.85"/><rect x="-14" y="-56" width="28" height="36" rx="4" fill="${NAVY}"/><path d="M-60 -6 H60" stroke="${NAVY}" stroke-width="6"/></g>
      ${person(260, 620, 0.75)}${person(320, 625, 0.8)}${person(700, 620, 0.75)}${person(760, 625, 0.8)}${person(900, 622, 0.75)}${person(960, 627, 0.8)}
      <g transform="translate(400 520)"><rect x="-120" y="-14" width="240" height="28" rx="14" fill="${MEDICAL_LIGHT}"/><rect x="-80" y="-14" width="160" height="28" rx="14" fill="${INK}" opacity="0.85"/></g>
      ${chip()}`;
  },
  orientation() {
    return `${sky()}${ground(570)}${sun(1030, 130)}
      ${building(200, 330, 300, 230, MEDICAL_LIGHT, true)}${windows(232, 390, 3, 2, 26)}
      ${building(740, 300, 280, 260, NAVY_LIGHT, true)}${windows(772, 360, 3, 2, 26)}
      ${tree(120, 530, 0.9)}${tree(1080, 525, 1)}
      ${person(420, 630, 0.9)}${person(470, 625, 0.95)}${person(520, 632, 0.9)}${person(570, 620, 0.98)}${person(620, 634, 0.9)}
      <g transform="translate(600 500) rotate(-8)"><rect x="-70" y="-52" width="140" height="104" rx="8" fill="${GOLD_LIGHT}"/><path d="M-70 -52 L-70 8 L70 8 L70 -52 L0 -88 Z" fill="${GOLD_LIGHT}"/><path d="M-70 -20 H70 M0 -52 V-88" stroke="${NAVY}" stroke-width="5"/></g>
      ${chip()}`;
  },
  trial() {
    return `${sky()}${ground(650)}
      <g transform="translate(600 350)">
        <rect x="-120" y="30" width="240" height="170" rx="10" fill="${NAVY_LIGHT}"/>
        <path d="M-90 30 V-20 L-40 -20 L-40 30 M-40 -20 L40 -20 M40 -20 L40 30 M-90 -20 V-80 L-40 -80 V-20" stroke="${INK}" stroke-width="10" fill="none" stroke-linecap="round"/>
        <circle cx="-90" cy="-80" r="14" fill="${GOLD_LIGHT}"/><circle cx="0" cy="-40" r="10" fill="${MEDICAL_LIGHT}"/>
        <rect x="-100" y="60" width="60" height="10" rx="5" fill="${MEDICAL}" opacity="0.7"/>
        <path d="M60 60 L120 60 M60 90 L120 90 M60 120 L120 120" stroke="${GOLD_LIGHT}" stroke-width="8" stroke-linecap="round"/>
        <circle cx="150" cy="60" r="12" fill="${INK}"/><circle cx="150" cy="90" r="12" fill="${INK}"/><circle cx="150" cy="120" r="12" fill="${INK}"/>
      </g>
      <path d="M180 680 H1020" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="2"/>
      ${chip()}`;
  },
  innovation() {
    return `${sky()}${ground(650)}
      <g transform="translate(600 340)">
        <path d="M0 -150 C70 -150 120 -90 110 -20 C104 40 60 70 50 120 L-50 120 C-60 70 -104 40 -110 -20 C-120 -90 -70 -150 0 -150 Z" fill="${GOLD_LIGHT}"/>
        <path d="M0 -110 C-36 -110 -60 -84 -54 -52 C-50 -30 -36 -16 -34 0 L-50 0 L-50 24 L-28 24 L-24 70 L24 70 L28 24 L50 24 L50 0 L34 0 C36 -16 50 -30 54 -52 C60 -84 36 -110 0 -110 Z" fill="${NAVY}" opacity="0.92"/>
        <path d="M-18 96 H18 V130 H-18 Z" fill="${MEDICAL}"/>
        <circle cx="0" cy="-130" r="26" fill="${GOLD}"/>
      </g>
      <path d="M140 660 C320 620 880 620 1060 660" stroke="${MEDICAL_LIGHT}" stroke-opacity="0.6" stroke-width="4" fill="none"/>
      ${chip()}`;
  },
};

function portrait(label) {
  const initials = initialsOf(label);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${NAVY_LIGHT}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GOLD_LIGHT}"/><stop offset="1" stop-color="${GOLD}"/></linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  <circle cx="640" cy="120" r="200" fill="${MEDICAL}" opacity="0.35"/>
  <circle cx="120" cy="860" r="220" fill="${GOLD}" opacity="0.14"/>
  <circle cx="0" cy="0" r="120" fill="${MEDICAL_LIGHT}" opacity="0.25"/>
  <g transform="translate(400 470)">
    <circle cx="0" cy="-120" r="130" fill="${INK}" opacity="0.96"/>
    <path d="M-180 -10 C-180 -130 -240 -150 -120 -60 C-210 -160 210 -160 120 -60 C240 -150 180 -130 180 -10 C210 120 -210 120 -180 -10 Z" fill="${INK}" opacity="0.96"/>
    <circle cx="0" cy="-128" r="24" fill="${NAVY}" opacity="0.9"/>
    <path d="M-56 -120 Q0 -86 56 -120" stroke="${NAVY}" stroke-width="6" fill="none" opacity="0.7" stroke-linecap="round"/>
  </g>
  <g transform="translate(400 850)">
    <rect x="-190" y="-60" width="380" height="120" rx="22" fill="rgba(255,255,255,0.1)" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="2"/>
    <circle cx="0" cy="0" r="34" fill="url(#gold)"/>
    <text x="0" y="8" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="${NAVY}">${initials}</text>
    <text x="0" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="4" fill="${GOLD_LIGHT}">TAU</text>
  </g>
</svg>`;
}

function svgDoc(body, width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">\n${body}\n</svg>`;
}

/* ---------------------------------- commons ---------------------------------- */

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchCommons(query, opts = {}, attempt = 1) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=20` +
    "&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=1600&format=json" +
    `&origin=*&uselang=en&maxlag=5`;
  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": "TAU-website-asset-bot/1.0 (dev demo site)" } });
  } catch {
    if (attempt >= 4) throw new Error("Commons API network error");
    await sleep(attempt * 3000);
    return searchCommons(query, opts, attempt + 1);
  }
  if (res.status === 429 || res.status === 503) {
    if (attempt >= 5) throw new Error(`Commons API rate limited (${res.status})`);
    await sleep(attempt * 4000);
    return searchCommons(query, opts, attempt + 1);
  }
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {});
  const badTitle = /logo|flag|map of|diagram|chart|seal|coat of arms|svg|pdf|icon|infographic/i;
  const minWidth = opts?.minWidth ?? 500;
  const good = pages.find((p) => {
    const info = p.imageinfo?.[0];
    if (!info) return false;
    if (!/image\/(jpeg|png|webp)/.test(info.mime || "")) return false;
    const title = p.title || "";
    if (badTitle.test(title)) return false;
    if (info.height && info.width && info.width < info.height * 0.5) return false;
    if (info.width && info.width < minWidth) return false;
    return true;
  });
  if (!good) throw new Error("no suitable image found");
  const info = good.imageinfo[0];
  return {
    url: info.thumburl || info.url,
    page: info.descriptionurl,
    title: good.title,
    author: info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").slice(0, 120) || "Unknown",
    license: info.extmetadata?.LicenseShortName?.value || "Unknown",
  };
}

/* ----------------------------------- main ----------------------------------- */

async function fetchPhoto(label, found, attempt = 1) {
  const target = path.join(OUT, `${label}.jpg`);
  const res = await fetch(found.url, { headers: { "User-Agent": "TAU-website-asset-bot/1.0" } });
  if (res.status === 429 || res.status === 503) {
    if (attempt >= 6) throw new Error(`download rate limited (${res.status})`);
    await sleep(attempt * 3000);
    return fetchPhoto(label, found, attempt + 1);
  }
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10000) throw new Error("download too small");
  await writeFile(target, buf);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest = {};
  const attribution = [];

  let previous = {};
  try {
    previous = JSON.parse(await readFile(path.join(OUT, "manifest.json"), "utf8"));
  } catch {
    /* first run */
  }

  const labels = Object.entries(LABELS);
  for (let i = 0; i < labels.length; i += 1) {
    const [label, def] = labels[i];
    const name = `${label}.svg`;
    let entry = { file: name, kind: def.kind, theme: def.theme || "portrait" };

    const cached = previous[label];
    if (cached && cached.file) {
      try {
        await stat(path.join(OUT, cached.file));
        entry = cached;
        console.log(`[${i + 1}/${labels.length}] ${label}  (exists)`);
        manifest[label] = entry;
        if (entry.source) attribution.push(`- ${label}: [${entry.original}](${entry.page}) — ${entry.license} — ${entry.author}`);
        await sleep(700);
        continue;
      } catch {
        /* cached entry has no file on disk; regenerate */
      }
    }

    if (def.kind === "photo") {
      try {
        const found = await searchCommons(def.query, { minWidth: def.minWidth });
        entry = {
          file: `${label}.jpg`,
          kind: "photo",
          theme: def.theme,
          source: found.url,
          page: found.page,
          original: found.title,
        };
        await fetchPhoto(label, found);
        await sleep(1200);
        attribution.push(
          `- ${label}: [${found.title}](${found.page}) — ${found.license} — ${found.author}`,
        );
        console.log(`[${i + 1}/${labels.length}] ${label}.jpg  (photo)`);
      } catch (err) {
        entry = { file: name, kind: "photo", theme: def.theme, note: "svg fallback" };
        console.log(`[${i + 1}/${labels.length}] ${label}.svg  (photo failed: ${err.message})`);
      }
    } else {
      console.log(`[${i + 1}/${labels.length}] ${label}.svg  (portrait)`);
    }
    await sleep(1600);

    if (entry.file.endsWith(".svg")) {
      const body = def.kind === "photo" ? scenes[def.theme]() : portrait(label);
      await writeFile(path.join(OUT, entry.file), svgDoc(body, W, H));
    }

    manifest[label] = entry;
  }

  await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

  if (attribution.length) {
    const md = [
      "# Image attribution",
      "",
      "Real photographs on this page are sourced from Wikimedia Commons (free-license stock photography)",
      "and are used here for presentation purposes only. Generated illustrations are original TAU-branded",
      "vector artwork and require no attribution.",
      "",
      ...attribution,
      "",
    ].join("\n");
    await writeFile(path.join(OUT, "ATTRIBUTION.md"), md);
  }

  /* --------------------------- codemod image paths --------------------------- */
  const srcDir = path.join(ROOT, "src");
  const toReplace = new Map();
  for (const [label, entry] of Object.entries(manifest)) {
    toReplace.set(`/images/placeholders/${label}.jpg`, `/images/placeholders/${entry.file}`);
    toReplace.set(`/images/placeholders/${label}.svg`, `/images/placeholders/${entry.file}`);
  }

  async function walk(dir) {
    const out = [];
    for (const entry of await readdir(dir)) {
      const full = path.join(dir, entry);
      if ((await stat(full)).isDirectory()) out.push(...(await walk(full)));
      else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
    }
    return out;
  }

  let changed = 0;
  for (const file of await walk(srcDir)) {
    const content = await readFile(file, "utf8");
    let next = content;
    for (const [from, to] of toReplace) {
      next = next.split(from).join(to);
    }
    if (next !== content) {
      await writeFile(file, next);
      changed += 1;
      console.log(`rewrote ${path.relative(ROOT, file)}`);
    }
  }

  console.log(`\nDone. ${labels.length} images, ${changed} source files updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
