import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "public", "art", "v1");
const OUTLINE = "#0b0e0d";
const WHITE = "#f3efe5";
const SHADOW = "#beb8ad";

type Asset = { group: string; name: string; art: string };
const assets: Asset[] = [];
const add = (group: string, name: string, art: string) => assets.push({ group, name, art });
const rect = (x: number, y: number, width: number, height: number, fill: string, extra = "") => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" ${extra}/>`;
const polygon = (points: string, fill: string, extra = "") => `<polygon points="${points}" fill="${fill}" ${extra}/>`;
const line = (points: string, stroke: string, width = 2) => `<polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`;

// Fixed Character Template V1 anchors; every output remains a full 128×128 transparent layer.
const anchors = {
  body: [29, 76, 70, 43], head: [45, 27, 40, 50], eyes: [48, 43, 35, 18], mouth: [54, 62, 22, 10],
  hair: [43, 25, 43, 48], outfit: [34, 75, 61, 43], workstation: [3, 94, 122, 34], screens: [3, 18, 122, 82],
  prop: [92, 77, 26, 25], environment: [0, 0, 128, 128],
} as const;
add("body", "average", `${rect(42, 77, 44, 38, WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("42,80 34,88 35,111 43,116 48,91", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("86,80 94,88 93,111 85,116 80,91", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${rect(37, 101, 9, 10, SHADOW)}${rect(82, 101, 9, 10, SHADOW)}`);
add("body", "lanky", `${rect(50, 76, 28, 40, WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("50,80 42,85 39,117 46,119 55,88", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("78,80 86,85 89,117 82,119 73,88", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${rect(42, 107, 7, 9, SHADOW)}${rect(79, 107, 7, 9, SHADOW)}`);
add("body", "wide-shoulders", `${polygon("29,82 40,76 88,76 99,82 94,116 34,116", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("31,83 24,91 27,113 35,116 42,88", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("97,83 104,91 101,113 93,116 86,88", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${rect(29, 79, 12, 5, SHADOW)}${rect(87, 79, 12, 5, SHADOW)}`);

add("head", "round", `${polygon("51,38 56,32 73,32 80,39 82,59 75,71 54,71 47,59 47,44", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${rect(48, 49, 4, 12, SHADOW)}${rect(72, 67, 5, 3, SHADOW)}`);
add("head", "potato", `${polygon("51,34 75,37 83,49 79,67 70,74 56,72 46,64 44,47", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${rect(75, 46, 4, 5, SHADOW)}${rect(48, 60, 4, 6, SHADOW)}`);
add("head", "long", `${polygon("54,27 74,27 79,41 77,67 70,76 57,76 50,68 49,40", WHITE, `stroke="${OUTLINE}" stroke-width="3"`)}${rect(51, 52, 4, 14, SHADOW)}${rect(69, 71, 5, 3, SHADOW)}`);

add("eyes", "sleepy", `${rect(50, 50, 12, 3, OUTLINE)}${rect(68, 50, 12, 3, OUTLINE)}${rect(53, 53, 7, 2, "#756e68")}${rect(70, 53, 7, 2, "#756e68")}`);
add("eyes", "half-lidded", `${rect(49, 48, 13, 7, WHITE, `stroke="${OUTLINE}" stroke-width="2"`)}${rect(68, 48, 13, 7, WHITE, `stroke="${OUTLINE}" stroke-width="2"`)}${rect(49, 48, 13, 4, "#867e75")}${rect(68, 48, 13, 4, "#867e75")}${rect(57, 52, 3, 3, OUTLINE)}${rect(70, 52, 3, 3, OUTLINE)}`);
add("eyes", "focused", `${polygon("48,49 62,46 60,55 50,54", WHITE, `stroke="${OUTLINE}" stroke-width="2"`)}${polygon("68,46 82,49 80,54 70,55", WHITE, `stroke="${OUTLINE}" stroke-width="2"`)}${rect(56, 49, 3, 5, OUTLINE)}${rect(70, 49, 3, 5, OUTLINE)}${rect(48, 43, 15, 3, OUTLINE)}${rect(68, 43, 15, 3, OUTLINE)}`);
add("eyes", "dead-inside", `${line("51,48 60,57", OUTLINE, 3)}${line("60,48 51,57", OUTLINE, 3)}${line("69,48 78,57", OUTLINE, 3)}${line("78,48 69,57", OUTLINE, 3)}${rect(54, 59, 4, 2, "#6c645d")}${rect(72, 59, 4, 2, "#6c645d")}`);

add("mouth", "flat", `${rect(57, 65, 16, 3, OUTLINE)}${rect(60, 68, 10, 2, "#6b343a")}`);
add("mouth", "smirk", `${rect(56, 65, 11, 3, OUTLINE)}${rect(66, 63, 8, 3, OUTLINE)}${rect(70, 62, 4, 2, "#a65b66")}`);
add("mouth", "tiny-frown", `${rect(59, 64, 11, 3, OUTLINE)}${rect(57, 62, 3, 3, OUTLINE)}${rect(70, 62, 3, 3, OUTLINE)}`);

add("hair", "buzz-cut", `${polygon("47,42 49,34 56,29 74,29 80,36 81,43", "#2e2925", `stroke="${OUTLINE}" stroke-width="3"`)}${[53,59,65,71,77].map((x) => rect(x, 33 + x % 2, 2, 2, "#59493d")).join("")}`);
add("hair", "shaved", `${rect(54, 32, 4, 2, "#81746a")}${rect(62, 30, 4, 2, "#81746a")}${rect(70, 32, 4, 2, "#81746a")}${rect(78, 38, 2, 5, "#81746a")}`);
add("hair", "short-messy", `${polygon("46,44 47,35 52,36 55,27 61,34 66,25 70,35 78,29 78,37 83,36 80,45 73,42 68,47 62,40 56,46 52,41", "#332a25", `stroke="${OUTLINE}" stroke-width="3"`)}${rect(56, 32, 5, 3, "#5e4837")}${rect(71, 34, 4, 3, "#5e4837")}`);
add("hair", "hood-up", `${polygon("43,60 44,40 51,28 76,28 84,39 86,61 78,59 77,43 72,35 56,35 50,44 51,59", "#242e31", `stroke="${OUTLINE}" stroke-width="3"`)}${rect(44, 58, 9, 15, "#344348")}${rect(77, 58, 8, 15, "#344348")}${rect(48, 39, 4, 16, "#566168")}`);

for (const [name, color] of [["warm-light", "#e9b692"], ["bronze", "#a96d45"], ["olive-tan", "#a48658"], ["deep-brown", "#4a2b24"]] as const) add("skin", name, rect(0, 0, 128, 128, color));

add("outfit", "torn-hoodie", `${polygon("38,82 48,76 80,76 91,83 88,116 40,116", "#554d4b", `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("49,78 64,91 79,78", "#6a5e59")}${rect(62, 90, 3, 25, "#2d2b2b")}${rect(43, 102, 10, 4, "#272626")}${polygon("77,110 88,105 87,116 78,116", "#201f1f")}`);
add("outfit", "clean-hoodie", `${polygon("38,82 48,76 80,76 91,83 88,116 40,116", "#26393b", `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("49,78 64,91 79,78", "#43575a")}${rect(62, 89, 3, 27, "#111817")}${rect(49, 104, 30, 9, "#1c2c2e")}${rect(56, 83, 3, 15, "#7a5782")}${rect(70, 83, 3, 15, "#7a5782")}`);
add("outfit", "pattern-hoodie", `${polygon("37,82 48,76 80,76 92,83 88,116 40,116", "#463755", `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("49,78 64,91 79,78", "#6b547c")}${[43,51,59,67,75,83].map((x,i)=>rect(x, 96 + (i%2)*7, 5, 5, i%2 ? "#2ca477" : "#d2a84d")).join("")}${rect(62, 90, 3, 26, OUTLINE)}`);
add("outfit", "luxury-coat", `${polygon("34,82 48,75 80,75 95,82 90,117 39,117", "#1e2028", `stroke="${OUTLINE}" stroke-width="3"`)}${polygon("38,82 61,101 55,116 39,116", "#363a48")}${polygon("91,82 67,101 73,116 90,116", "#292c38")}${rect(61, 94, 6, 22, "#6e4b86")}${rect(42, 110, 43, 3, "#d9b347")}${rect(46, 105, 5, 5, "#d9b347")}`);

add("environment", "poor-room", `${rect(0,0,128,128,"#171917")}${rect(0,67,128,61,"#0b100e")}${[12,31,50].map(y=>[0,27,54,81,108].map(x=>rect(x+(y%3)*4,y,22,2,"#34372f")).join("")).join("")}${rect(8,18,29,36,"#302a2c",`stroke="${OUTLINE}" stroke-width="3"`)}${rect(92,20,22,29,"#2b3230",`stroke="${OUTLINE}" stroke-width="3"`)}${rect(96,25,14,3,"#a5464f")}`);
add("environment", "basic-trading-room", `${rect(0,0,128,128,"#18201f")}${rect(0,68,128,60,"#0a1110")}${rect(8,15,36,39,"#25302e",`stroke="#59625f" stroke-width="3"`)}${rect(84,15,35,39,"#25302e",`stroke="#59625f" stroke-width="3"`)}${[20,28,36,44].map(y=>rect(88,y,27,2,"#55ad78")).join("")}${rect(14,22,23,19,"#111918")}${line("16,38 22,31 28,34 36,25", "#d2545f",2)}`);
add("environment", "clean-crypto-office", `${rect(0,0,128,128,"#0e1b1a")}${rect(0,69,128,59,"#08100f")}${rect(5,10,118,49,"#132526",`stroke="#3f5e58" stroke-width="3"`)}${rect(63,12,3,45,"#3f5e58")}${[14,25,37,76,89,103].map((x,i)=>rect(x,45-(i%3)*7,8,12+(i%3)*7,i%2?"#1c3940":"#1b302f")).join("")}${[19,43,80,108].map((x,i)=>rect(x,49+(i%2)*4,3,3,i%2?"#cd5964":"#4fe391")).join("")}`);
add("environment", "luxury-night-office", `${rect(0,0,128,128,"#0b0d16")}${rect(0,69,128,59,"#08090d")}${rect(6,8,116,52,"#101d2b",`stroke="#b99845" stroke-width="3"`)}${rect(64,10,3,48,"#b99845")}${[14,26,39,76,90,105].map((x,i)=>rect(x,43-(i%3)*8,8,15+(i%3)*8,"#17273b")).join("")}${[18,32,50,80,99,112].map((x,i)=>rect(x,49+(i%2)*4,3,3,i%2?"#8059b1":"#e4bd52")).join("")}${rect(4,63,120,5,"#665027")}`);

add("workstation", "old-laptop-desk", `${rect(10,103,108,7,"#74533b",`stroke="${OUTLINE}" stroke-width="3"`)}${polygon("17,110 31,110 28,128 20,128", "#4d3628")}${polygon("98,110 112,110 108,128 100,128", "#4d3628")}${rect(44,78,40,23,"#323936",`stroke="${OUTLINE}" stroke-width="3"`)}${line("72,80 64,88 70,93 63,99", "#d9e0d7",1)}${polygon("38,101 90,101 84,105 43,105", "#69716d")}`);
add("workstation", "single-monitor-desk", `${rect(7,98,114,8,"#57463a",`stroke="${OUTLINE}" stroke-width="3"`)}${rect(14,106,8,22,"#3c302a")}${rect(106,106,8,22,"#3c302a")}${rect(39,59,50,35,"#121a19",`stroke="#68736e" stroke-width="3"`)}${rect(61,94,6,7,"#747f7a")}`);
add("workstation", "dual-monitor-setup", `${polygon("4,98 124,98 117,108 11,108","#252a2b",`stroke="#6d4e83" stroke-width="3"`)}${rect(18,61,43,32,"#111918",`stroke="#596762" stroke-width="3"`)}${rect(67,58,45,35,"#111918",`stroke="#596762" stroke-width="3"`)}${rect(37,93,5,7,"#737d78")}${rect(89,93,5,7,"#737d78")}${rect(24,103,80,2,"#6d4e83")}`);
add("workstation", "executive-trading-setup", `${rect(3,94,122,10,"#202626",`stroke="#d0aa46" stroke-width="3"`)}${rect(9,104,110,24,"#111615",`stroke="#545e5a" stroke-width="3"`)}${[17,34,51,68,85,102].map((x,i)=>rect(x,111,10,4,i%2?"#ca525e":"#49dd87")).join("")}${rect(13,120,102,3,"#d0aa46")}`);

const monitor = (x:number,y:number,w:number,h:number,color:string,points:string) => `${rect(x,y,w,h,"#07110f",`stroke="#5b6863" stroke-width="3"`)}${line(points,color,2)}`;
add("screens", "red-dump-chart", `${monitor(39,59,50,35,"#e45662","44,67 52,70 59,75 67,74 75,83 84,88")}${rect(61,94,6,6,"#68726d")}`);
add("screens", "green-uptrend-chart", `${monitor(39,59,50,35,"#4fe28b","44,86 52,82 59,83 67,74 75,70 84,64")}${rect(61,94,6,6,"#68726d")}`);
add("screens", "two-mixed-charts", `${monitor(13,62,48,31,"#4fe28b","18,85 25,78 32,81 40,71 55,66")}${monitor(67,59,48,34,"#e45662","72,68 80,73 87,69 96,80 109,86")}`);
add("screens", "premium-chart-wall", `${rect(3,18,122,56,"none",`stroke="#c5a245" stroke-width="3"`)}${monitor(6,24,36,22,"#4fe28b","10,40 17,34 23,37 29,29 38,27")}${monitor(46,20,36,25,"#e45662","50,27 57,30 64,28 70,36 78,40")}${monitor(86,24,36,22,"#4fe28b","90,41 98,36 104,38 111,29 118,27")}${monitor(25,49,36,22,"#e45662","29,55 36,58 43,56 50,64 57,67")}${monitor(66,49,36,22,"#4fe28b","70,66 77,62 84,63 91,54 98,52")}`);

add("prop", "coffee-mug", `${rect(96,84,12,15,"#ddd7c9",`stroke="${OUTLINE}" stroke-width="2"`)}${rect(108,88,6,8,"none",`stroke="#ddd7c9" stroke-width="3"`)}${rect(99,82,2,3,"#a9b1ac")}${rect(104,79,2,5,"#a9b1ac")}`);
add("prop", "energy-drink", `${rect(98,80,9,19,"#69429a",`stroke="${OUTLINE}" stroke-width="2"`)}${line("101,84 105,84 102,90 106,90 101,96","#50e18a",1)}${rect(100,79,5,2,"#a9b1ac")}`);
add("prop", "purple-crystal", `${polygon("101,77 110,84 108,96 99,99 94,89", "#a968e0",`stroke="${OUTLINE}" stroke-width="3"`)}${polygon("101,80 104,88 101,96 97,89", "#d2a4f5")}${rect(93,98,19,3,"#4a3657")}`);
add("prop", "gold-crypto-trophy", `${polygon("96,78 113,78 110,90 106,95 101,95 98,90", "#e3b948",`stroke="${OUTLINE}" stroke-width="3"`)}${rect(103,94,4,5,"#e3b948")}${rect(98,99,14,3,"#9e7530")}${rect(102,82,5,5,"#fff0a0")}${rect(94,81,4,7,"none",`stroke="#e3b948" stroke-width="2"`)}${rect(113,81,4,7,"none",`stroke="#e3b948" stroke-width="2"`)}`);

function svg(art: string): Buffer {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" shape-rendering="crispEdges"><g stroke-linejoin="miter" stroke-linecap="square">${art}</g></svg>`);
}

const templateSourceIndex = process.argv.indexOf("--template-source");
const templateSource = templateSourceIndex >= 0 ? process.argv[templateSourceIndex + 1] : undefined;
if (templateSource) {
  const templateDirectory = path.join(ROOT, "template");
  await mkdir(templateDirectory, { recursive: true });
  await sharp(templateSource).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).resize(112, 112, { fit: "contain", kernel: "nearest", background: { r: 0, g: 0, b: 0, alpha: 0 } }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(templateDirectory, "production-character-template-v1.png"));
}

for (const asset of assets) {
  const directory = path.join(ROOT, asset.group);
  await mkdir(directory, { recursive: true });
  await sharp(svg(asset.art)).ensureAlpha().png({ compressionLevel: 9, palette: false }).toFile(path.join(directory, `${asset.name}.png`));
}

await writeFile(path.join(ROOT, "production-pack-v1.json"), `${JSON.stringify({
  version: "v1", canvas: { width: 128, height: 128 },
  anchors,
  assets: assets.map(({ group, name }) => `/art/v1/${group}/${name}.png`),
}, null, 2)}\n`, "utf8");

console.log(`Built ${assets.length} aligned production PNG layers in ${ROOT}`);
