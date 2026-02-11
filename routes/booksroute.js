const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../database/mongo");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function parseSort(sortParam) {
  if (!sortParam) return { _id: 1 };
  const [field, dirRaw] = String(sortParam).split(":");
  const dir = (dirRaw || "asc").toLowerCase() === "desc" ? -1 : 1;

  const allowed = new Set(["title", "author", "year", "rating", "createdAt"]);
  if (!allowed.has(field)) return { _id: 1 };

  return { [field]: dir };
}

function parseProjection(fieldsParam) {
  if (!fieldsParam) return null;
  const fields = String(fieldsParam)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowed = new Set([
    "title",
    "author",
    "description",
    "series",
    "seriesNumber",
    "tags",
    "year",
    "rating",
    "pages",
    "createdAt",
  ]);

  const projection = {};
  for (const f of fields) {
    if (allowed.has(f)) projection[f] = 1;
  }
  return Object.keys(projection).length ? projection : null;
}

router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const col = db.collection("books");

    const {
      author,
      series,
      tag,
      minRating,
      yearFrom,
      yearTo,
      sort,
      fields,
      limit,
      page,
    } = req.query;

    const filter = {};

    if (author) filter.author = { $regex: String(author), $options: "i" };
    if (series) filter.series = { $regex: String(series), $options: "i" };
    if (tag) filter.tags = { $in: [String(tag)] };

    if (minRating !== undefined) {
      const mr = Number(minRating);
      if (Number.isNaN(mr)) return res.status(400).json({ error: "Invalid minRating" });
      filter.rating = { $gte: mr };
    }

    if (yearFrom !== undefined || yearTo !== undefined) {
      const yf = yearFrom !== undefined ? Number(yearFrom) : null;
      const yt = yearTo !== undefined ? Number(yearTo) : null;

      if ((yf !== null && Number.isNaN(yf)) || (yt !== null && Number.isNaN(yt))) {
        return res.status(400).json({ error: "Invalid yearFrom/yearTo" });
      }

      filter.year = {};
      if (yf !== null) filter.year.$gte = yf;
      if (yt !== null) filter.year.$lte = yt;
    }

    const sortObj = parseSort(sort);
    const projection = parseProjection(fields);

    const lim = limit !== undefined ? Number(limit) : 24;
    if (Number.isNaN(lim) || lim <= 0 || lim > 200) {
      return res.status(400).json({ error: "Invalid limit (1..200)" });
    }

    const pageNum = page !== undefined ? Number(page) : 1;
    if (Number.isNaN(pageNum) || pageNum <= 0 || pageNum > 100000) {
      return res.status(400).json({ error: "Invalid page" });
    }

    const skip = (pageNum - 1) * lim;

    const [items, total] = await Promise.all([
      col
        .find(filter, projection ? { projection } : undefined)
        .sort(sortObj)
        .skip(skip)
        .limit(lim)
        .toArray(),
      col.countDocuments(filter),
    ]);

    const pages = Math.max(1, Math.ceil(total / lim));
    res.status(200).json({
      items,
      meta: { page: pageNum, limit: lim, total, pages },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server/database error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = getDb();
    const col = db.collection("books");

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

    const book = await col.findOne({ _id: new ObjectId(id) });
    if (!book) return res.status(404).json({ error: "Book not found" });

    res.status(200).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server/database error" });
  }
});

function validateBookPayload(body) {
  const {
    title,
    author,
    description = "",
    series = "",
    seriesNumber = null,
    tags = [],
    year = null,
    rating = null,
    pages = null,
  } = body || {};

  if (!title || !author) {
    return { ok: false, error: "Missing required fields: title, author" };
  }

  const cleanTitle = String(title).trim();
  const cleanAuthor = String(author).trim();
  if (cleanTitle.length < 2 || cleanAuthor.length < 2) {
    return { ok: false, error: "Title/author too short" };
  }

  const yearNum = year === null || year === "" ? null : Number(year);
  if (yearNum !== null && (Number.isNaN(yearNum) || yearNum < 0 || yearNum > 2100)) {
    return { ok: false, error: "Invalid year" };
  }

  const ratingNum = rating === null || rating === "" ? null : Number(rating);
  if (ratingNum !== null && (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5)) {
    return { ok: false, error: "Invalid rating (0..5)" };
  }

  const pagesNum = pages === null || pages === "" ? null : Number(pages);
  if (pagesNum !== null && (Number.isNaN(pagesNum) || pagesNum <= 0 || pagesNum > 100000)) {
    return { ok: false, error: "Invalid pages" };
  }

  const seriesNumberNum =
    seriesNumber === null || seriesNumber === "" ? null : Number(seriesNumber);
  if (
    seriesNumberNum !== null &&
    (Number.isNaN(seriesNumberNum) || seriesNumberNum < 0 || seriesNumberNum > 10000)
  ) {
    return { ok: false, error: "Invalid seriesNumber" };
  }

  const tagsArr = Array.isArray(tags)
    ? tags.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 20)
    : [];

  return {
    ok: true,
    value: {
      title: cleanTitle,
      author: cleanAuthor,
      description: String(description || ""),
      series: String(series || ""),
      seriesNumber: seriesNumberNum,
      tags: tagsArr,
      year: yearNum,
      rating: ratingNum,
      pages: pagesNum,
    },
  };
}

router.post("/", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const col = db.collection("books");

    const v = validateBookPayload(req.body);
    if (!v.ok) return res.status(400).json({ error: v.error });

    const doc = { ...v.value, createdAt: new Date() };

    const result = await col.insertOne(doc);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server/database error" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const col = db.collection("books");

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

    const v = validateBookPayload(req.body);
    if (!v.ok) return res.status(400).json({ error: v.error });

    const update = { $set: v.value };

    const result = await col.updateOne({ _id: new ObjectId(id) }, update);
    if (result.matchedCount === 0) return res.status(404).json({ error: "Book not found" });

    res.status(200).json({ message: "Updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server/database error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const col = db.collection("books");

    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Book not found" });

    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server/database error" });
  }
});

module.exports = router;
