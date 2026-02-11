const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../database/mongo");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const favorites = db.collection("favorites");

    const userId = new ObjectId(req.session.userId);

    const fav = await favorites.findOne(
      { userId },
      { projection: { _id: 0, books: 1 } }
    );

    res.json(fav?.books || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:bookId", requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Invalid bookId" });
    }

    const db = getDb();
    const favorites = db.collection("favorites");

    const userId = new ObjectId(req.session.userId);

    await favorites.updateOne(
      { userId },
      { $pull: { books: { bookId: new ObjectId(bookId) } } },
      { upsert: true }
    );

    await favorites.updateOne(
      { userId },
      {
        $push: {
          books: {
            bookId: new ObjectId(bookId),
            addedAt: new Date(),
          },
        },
      },
      { upsert: true }
    );

    res.status(200).json({ message: "Added to favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:bookId", requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ error: "Invalid bookId" });
    }

    const db = getDb();
    const favorites = db.collection("favorites");

    const userId = new ObjectId(req.session.userId);

    await favorites.updateOne(
      { userId },
      {
        $pull: {
          books: { bookId: new ObjectId(bookId) },
        },
      }
    );

    res.status(200).json({ message: "Removed from favorites" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/full", requireAuth, async (req, res) => {
  try {
    const db = getDb();
    const favorites = db.collection("favorites");

    const userId = new ObjectId(req.session.userId);

    const pipeline = [
      { $match: { userId } },
      { $unwind: "$books" },
      {
        $lookup: {
          from: "books",
          localField: "books.bookId",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
      {
        $project: {
          _id: 0,
          addedAt: "$books.addedAt",
          book: {
            _id: "$book._id",
            title: "$book.title",
            author: "$book.author",
            year: "$book.year",
            rating: "$book.rating",
            tags: "$book.tags",
          },
        },
      },
    ];

    const result = await favorites.aggregate(pipeline).toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
