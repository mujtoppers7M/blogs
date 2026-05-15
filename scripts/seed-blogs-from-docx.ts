import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import mammoth from "mammoth";

const prisma = new PrismaClient();

const BLOGS_DIR = path.resolve(process.cwd(), "public", "blogs");
const IMAGE_DIR = path.join(BLOGS_DIR, "blog images");

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.docx$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (/(dsa|web development|programming|linkedin|g?soc|ai tools?)/.test(t)) return "Tech";
  if (/(hostel|pg|campus|clubs|gym|transport|life at muj|muj hostels?)/.test(t)) return "Campus Life";
  if (/(gpa|cgpa|scholarship|summer vacations?|met)/.test(t)) return "Academics";
  return "General";
}

function buildTags(title: string, category: string): string[] {
  const words = normalize(title)
    .split(" ")
    .filter((w) => w.length > 2);
  const unique = Array.from(new Set(words));
  return [category.toLowerCase(), ...unique].slice(0, 8);
}

function pickTitle(fileName: string, content: string): string {
  const firstLine = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 5);

  if (firstLine && firstLine.length <= 160) {
    return firstLine;
  }

  return fileName.replace(/\.docx$/i, "").trim();
}

async function getDocxFiles(): Promise<string[]> {
  const entries = await fs.readdir(BLOGS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".docx"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function getImageFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(IMAGE_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

function findMatchingImage(docFile: string, images: string[]): string | null {
  const docKey = normalize(docFile);

  for (const image of images) {
    const imageKey = normalize(image);
    if (!imageKey) continue;
    if (docKey.includes(imageKey) || imageKey.includes(docKey)) {
      return image;
    }
  }

  return null;
}

async function seedOne(docFile: string, imageFiles: string[]): Promise<void> {
  const docPath = path.join(BLOGS_DIR, docFile);
  const extracted = await mammoth.extractRawText({ path: docPath });
  const content = extracted.value.trim();

  if (!content) {
    console.log(`Skipping empty doc: ${docFile}`);
    return;
  }

  const title = pickTitle(docFile, content);
  const category = inferCategory(title);
  const tags = buildTags(title, category);
  const imageName = findMatchingImage(docFile, imageFiles);

  const existing = await prisma.blog.findFirst({
    where: { title },
    include: { coverImage: true },
  });

  if (existing) {
    await prisma.blog.update({
      where: { id: existing.id },
      data: { content, category, tags },
    });

    if (imageName) {
      const fileUrl = `/blogs/blog images/${encodeURIComponent(imageName)}`;
      if (existing.coverImage) {
        await prisma.coverImage.update({
          where: { blogId: existing.id },
          data: {
            fileName: imageName,
            fileUrl,
          },
        });
      } else {
        await prisma.coverImage.create({
          data: {
            fileName: imageName,
            fileUrl,
            blogId: existing.id,
          },
        });
      }
    }

    console.log(`Updated: ${title}`);
    return;
  }

  const created = await prisma.blog.create({
    data: {
      title,
      content,
      category,
      tags,
    },
  });

  if (imageName) {
    await prisma.coverImage.create({
      data: {
        fileName: imageName,
        fileUrl: `/blogs/blog images/${encodeURIComponent(imageName)}`,
        blogId: created.id,
      },
    });
  }

  console.log(`Created: ${title}`);
}

async function main(): Promise<void> {
  const docFiles = await getDocxFiles();
  const imageFiles = await getImageFiles();

  if (docFiles.length === 0) {
    console.log("No DOCX files found in public/blogs");
    return;
  }

  console.log(`Found ${docFiles.length} DOCX files and ${imageFiles.length} images.`);

  for (const docFile of docFiles) {
    await seedOne(docFile, imageFiles);
  }

  const count = await prisma.blog.count();
  console.log(`Seeding complete. Total blogs in DB: ${count}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
