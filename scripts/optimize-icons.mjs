import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import { join, basename } from "path";

const src = "/home/user/Lewis-tutoring/icons";
const out = "/home/user/Lewis-tutoring/public/icons";
mkdirSync(out, { recursive: true });

for (const f of readdirSync(src).filter((f) => f.endsWith(".png"))) {
  const name = basename(f, ".png")
    .replace(/^Icons_/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  await sharp(join(src, f))
    .trim()
    .resize(240, 240, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88 })
    .toFile(join(out, `${name}.webp`));
  console.log(name);
}
