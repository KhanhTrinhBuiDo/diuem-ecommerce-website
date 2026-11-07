// Quét public/images, ghi src/data/image-manifest.json (slot -> đường dẫn ảnh thật) và in bảng thiếu/đủ.
// Chạy tự động trước dev/build/typecheck. Thêm ảnh = bỏ file vào public/images/<thư mục>/<tên>.<đuôi> rồi push.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const imgDir = path.join(root, "public", "images");
const slots = JSON.parse(fs.readFileSync(path.join(root, "src/data/image-slots.json"), "utf8"));
const EXT = ["webp", "avif", "jpg", "jpeg", "png", "svg", "gif"]; // thứ tự ưu tiên nếu trùng tên

const found = {};
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else {
      const m = /\.([a-z0-9]+)$/i.exec(e.name);
      if (!m || !EXT.includes(m[1].toLowerCase())) continue;
      const rel = path.relative(imgDir, p).split(path.sep).join("/");
      const key = rel.slice(0, -m[0].length).toLowerCase();
      const cur = found[key];
      if (!cur || EXT.indexOf(m[1].toLowerCase()) < EXT.indexOf(/\.([a-z0-9]+)$/i.exec(cur)[1].toLowerCase())) found[key] = "/images/" + rel;
    }
  }
}
walk(imgDir);

const manifest = {};
for (const k of Object.keys(found).sort()) manifest[k] = found[k];
fs.writeFileSync(path.join(root, "src/data/image-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

const have = slots.filter((s) => manifest[s.key.toLowerCase()]);
const miss = slots.filter((s) => !manifest[s.key.toLowerCase()]);
const unknown = Object.keys(manifest).filter((k) => !slots.some((s) => s.key.toLowerCase() === k));
console.log(`[ảnh] ${have.length}/${slots.length} vị trí đã có ảnh.`);
if (miss.length && process.argv.includes("--report")) for (const s of miss) console.log(`  thiếu: public/images/${s.key}.(png|jpg|webp)  – ${s.where} [${s.size}]`);
if (unknown.length) console.log(`[ảnh] file không thuộc vị trí nào (kiểm tra lại tên): ${unknown.join(", ")}`);
