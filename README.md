# Fantasy Book Library

Fantasy Book Library is a simple web application built with Node.js and Express. Its
purpose is to allow users to browse and organize their favorite fantasy books. As the
project progresses, additional functionality will be implemented, such as adding new
books through forms, storing data in a database, and viewing detailed book information.

## Team Members:

- Ingkar Adilbek 
- Syndaly Yerzhan 

## Objective

- Use Express.js to handle GET and POST routes
- Build a working contact form that sends data to the backend
- Understand how req.body works
- Maintain clean folder structure and consistent design across pages

## Implemented Features

- Browse fantasy books by category and shelves

- Explore curated shelves (Epic Sagas, Dark Fantasy, etc.)

- View books in a catalog loaded dynamically from the API

- Add new books through a form

- Edit existing books

- Delete books

- Login / Signup (JWT)

- Role Based Access Model demonstration (Admin/User)

- Protected book write endpoints (POST/PUT/DELETE)

- Filter and sort books (by rating, year, tags)

- Contact form with server-side handling

- Responsive UI with navigation and carousel shelves

## Folder Structure
```
final_readiegreedy/
├─ database/
│  └─ mongo.js                 # MongoDB connection
├─ middleware/
│  └─ auth.js                  # JWT auth middleware
├─ public/
│  ├─ photos/                  # Book cover images
│  ├─ authclient.js            # Auth helpers 
│  ├─ authforms.js             # Login/Signup form logic
│  ├─ booksclient.js           # Frontend logic for CRUD
│  ├─ explore.js               # Carousel logic 
│  ├─ nav.js                   # Menu + search routing
│  ├─ random.js                # Random book page logic
│  ├─ subjects.js              # Subjects 
│  ├─ theme.js                 # Dark/light theme 
│  ├─ style.css                # Global styles 
│  └─ logo.svg                 # Logo
├─ routes/
│  ├─ authroute.js             # Auth API routes 
│  └─ booksroute.js            # Books API routes
├─ views/
│  ├─ index.html               # Main page
│  ├─ explore.html             # Shelves exploration page
│  ├─ books.html               # Books catalog + CRUD UI 
│  ├─ subjects.html            # Browse → Subjects
│  ├─ lists.html               # Browse → Lists (form)
│  ├─ k12.html                 # Browse → K-12 
│  ├─ random.html              # Browse → Random Book
│  ├─ vision.html              # Footer → Vision (themes)
│  ├─ about.html
│  ├─ contact.html
│  ├─ login.html
│  └─ signup.html
├─ contacts.json               # Contact form submissions
├─ lists.json                  # Lists submissions
├─ server.js                   # Express server entry point
├─ package.json
├─ package-lock.json
├─ .env.example                # Example environment v.
├─ .env                         # Your environment v. 
├─ .gitignore
└─ README.md
```

## Installation

Inside the project folder:

```bash
npm install
npm run seed
```

## How to Launch

Start the server with:
```bash
npm start
or
node server.js
```

## Testing the Features

#### Meaningful routes:

#### 1. https://readiegreedy.onrender.com -> Main page

#### 2. https://readiegreedy.onrender.com/books#add -> Add new Books to taste our CRUD operations system

#### 3. https://readiegreedy.onrender.com/contact -> Q&A page + Contact Support Staff

#### 4. https://readiegreedy.onrender.com/explore -> Trending books of each shelf

#### 5. https://readiegreedy.onrender.com/login -> Login page

#### 6. https://readiegreedy.onrender.com/signup -> Signup page

#### 7. https://readiegreedy.onrender.com/logout -> Logout page

## How to navigate through the website?

**Welcome to ReadieGreedy Fantasy Library!** 

Guide on using the website and making your journey joyful:

1. **Main** page has shelves designed specially designed for you, if you're struggling to find a genre to your liking. Definitely check them out!
2. **Books catalogue** page catched your eye? Add a book you found fabulous, feel free to add some details such as series number, rating and description!
3. **About page** is believed to be really helpful for those who've just recently began to like fantasy genre!
4. **Contact form** page will contain really popular question and every bit of your letters, helping us to improve content and receive some comments of our users! Also you'll be able to contact the supporting stuff!
5. **Explore** page navigates you through the trending books of the season! 
6. **Vision** page offers a light or dark visibility of the website!
7. **Subjects** page shows a list of topics for you to navigate through books!
8. **Random** page does the work for you: finds you the books of the week and find out more about you tastes!

**Live URL**: *[readieg/render.com](https://readiegreedy.onrender.com/)*

## Admin (Role-Based Access Control)

This project supports **user** and **admin** roles.

- Normal users can browse books and manage **their own favorites**.
- Admins can **create / edit / delete** books.

To bootstrap an admin account automatically, set these env vars before running:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME` (optional)

On startup, the app will create that admin user if it does not exist, or promote it to admin if it exists.
