require("dotenv").config();
const { connectMongo, closeMongo, getDb } = require("../database/mongo");

const SAMPLE_BOOKS = [
  { title: "The Hobbit", author: "J.R.R. Tolkien", year: 1937, rating: 4.8, tags: ["classic","adventure","fantasy"], description: "A reluctant hobbit goes on an unexpectedly large adventure.", series: "Middle-earth", seriesNumber: 1 },
  { title: "The Fellowship of the Ring", author: "J.R.R. Tolkien", year: 1954, rating: 4.9, tags: ["epic","classic","fantasy"], description: "The first part of The Lord of the Rings.", series: "The Lord of the Rings", seriesNumber: 1 },
  { title: "The Two Towers", author: "J.R.R. Tolkien", year: 1954, rating: 4.9, tags: ["epic","classic","fantasy"], description: "The second part of The Lord of the Rings.", series: "The Lord of the Rings", seriesNumber: 2 },
  { title: "The Return of the King", author: "J.R.R. Tolkien", year: 1955, rating: 4.9, tags: ["epic","classic","fantasy"], description: "The third part of The Lord of the Rings.", series: "The Lord of the Rings", seriesNumber: 3 },
  { title: "A Game of Thrones", author: "George R.R. Martin", year: 1996, rating: 4.7, tags: ["epic","politics","dark"], description: "Noble houses collide in a brutal struggle for the Iron Throne.", series: "A Song of Ice and Fire", seriesNumber: 1 },
  { title: "A Clash of Kings", author: "George R.R. Martin", year: 1998, rating: 4.6, tags: ["epic","politics","dark"], description: "War spreads as kings rise and fall.", series: "A Song of Ice and Fire", seriesNumber: 2 },
  { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", year: 2006, rating: 4.7, tags: ["heist","magic","epic"], description: "A crew plans a heist against an immortal tyrant.", series: "Mistborn", seriesNumber: 1 },
  { title: "The Well of Ascension", author: "Brandon Sanderson", year: 2007, rating: 4.6, tags: ["magic","epic"], description: "Power changes hands, and the world fights to survive.", series: "Mistborn", seriesNumber: 2 },
  { title: "The Hero of Ages", author: "Brandon Sanderson", year: 2008, rating: 4.7, tags: ["magic","epic"], description: "An ending that refuses to be small.", series: "Mistborn", seriesNumber: 3 },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", year: 2007, rating: 4.5, tags: ["magic","coming-of-age"], description: "A gifted student tells the story of his life.", series: "The Kingkiller Chronicle", seriesNumber: 1 },
  { title: "The Wise Man's Fear", author: "Patrick Rothfuss", year: 2011, rating: 4.4, tags: ["magic","coming-of-age"], description: "The story continues, complicated and costly.", series: "The Kingkiller Chronicle", seriesNumber: 2 },
  { title: "The Lies of Locke Lamora", author: "Scott Lynch", year: 2006, rating: 4.6, tags: ["heist","crime","fantasy"], description: "A thief and con artist targets the rich in a Venetian-like city.", series: "Gentleman Bastard", seriesNumber: 1 },
  { title: "Six of Crows", author: "Leigh Bardugo", year: 2015, rating: 4.6, tags: ["heist","dark"], description: "A crew attempts an impossible break-in.", series: "Six of Crows", seriesNumber: 1 },
  { title: "Crooked Kingdom", author: "Leigh Bardugo", year: 2016, rating: 4.7, tags: ["heist","dark"], description: "Revenge, consequences, and survival.", series: "Six of Crows", seriesNumber: 2 },
  { title: "The Blade Itself", author: "Joe Abercrombie", year: 2006, rating: 4.3, tags: ["dark","gritty"], description: "Moral clarity is cancelled. Permanently.", series: "The First Law", seriesNumber: 1 },
  { title: "Before They Are Hanged", author: "Joe Abercrombie", year: 2007, rating: 4.4, tags: ["dark","gritty"], description: "Journeys, wars, and the price of power.", series: "The First Law", seriesNumber: 2 },
  { title: "Last Argument of Kings", author: "Joe Abercrombie", year: 2008, rating: 4.4, tags: ["dark","gritty"], description: "Everybody wants an ending. Nobody likes the cost.", series: "The First Law", seriesNumber: 3 },
  { title: "The Way of Kings", author: "Brandon Sanderson", year: 2010, rating: 4.8, tags: ["epic","magic"], description: "Storms, oaths, and an absurdly big world.", series: "The Stormlight Archive", seriesNumber: 1 },
  { title: "Words of Radiance", author: "Brandon Sanderson", year: 2014, rating: 4.8, tags: ["epic","magic"], description: "Knights return. Chaos follows.", series: "The Stormlight Archive", seriesNumber: 2 },
  { title: "Oathbringer", author: "Brandon Sanderson", year: 2017, rating: 4.7, tags: ["epic","magic"], description: "History and truth collide.", series: "The Stormlight Archive", seriesNumber: 3 }
];

async function run() {
  await connectMongo();
  const db = getDb();
  const books = db.collection("books");

  const count = await books.countDocuments();
  if (count >= 20) {
    console.log(`Books collection already has ${count} records. Skipping seed.`);
    await closeMongo();
    return;
  }

  const docs = SAMPLE_BOOKS.map(b => ({
    ...b,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  await books.insertMany(docs);
  console.log(`Seeded ${docs.length} books.`);
  await closeMongo();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
