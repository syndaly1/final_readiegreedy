require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");

const session = require("express-session");

let MongoStore = require("connect-mongo");
MongoStore = MongoStore.default || MongoStore;

const { connectMongo, closeMongo } = require("./database/mongo");
const booksRouter = require("./routes/booksroute");
const authRouter = require("./routes/authroute");
const favoritesRouter = require("./routes/favoritesroute");
const adminRouter = require("./routes/adminroute");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error("Missing SESSION_SECRET in .env");
  process.exit(1);
}

app.use(
  session({
    name: "sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: process.env.MONGODB_DB,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.static("public"));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "index.html"))
);
app.get("/explore", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "explore.html"))
);
app.get("/about", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "about.html"))
);
app.get("/contact", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "contact.html"))
);
app.get("/books", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "books.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "login.html"))
);
app.get("/signup", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "signup.html"))
);

app.get("/subjects", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "subjects.html"))
);
app.get("/lists", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "lists.html"))
);
app.get("/k12", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "k12.html"))
);
app.get("/random", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "random.html"))
);
app.get("/vision", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "vision.html"))
);


app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("Missing required fields.");
  }

  const entry = {
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
    date: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, "contacts.json");

  let contacts = [];
  if (fs.existsSync(filePath)) {
    try {
      contacts = JSON.parse(fs.readFileSync(filePath, "utf8")) || [];
    } catch {
      contacts = [];
    }
  }

  contacts.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));

  res.send(`
    <div style="padding:40px;font-family:Arial">
      <h2>Thanks, ${entry.name}! Your message was received.</h2>
      <a href="/">Home</a>
    </div>
  `);
});

app.get("/volunteer", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "volunteer.html"));
});

app.get("/careers", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "careers.html"));
});

app.get("/blog", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "blog.html"));
});

app.get("/terms", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "terms.html"));
});

app.get("/donate", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "donate.html"));
});

app.get("/authors", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "authors.html"));
});

app.get("/devcenter", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "devcenter.html"));
});

app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.status(404).send("<h1 style='padding:40px'>404 Page Not Found</h1>");
});

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectMongo();
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

process.on("SIGINT", async () => {
  await closeMongo();
  process.exit(0);
});
