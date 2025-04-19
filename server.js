/*********************************************************************************
WEB322 – Assignment 03

I declare that this assignment is my own work.

Name: Raj Maharjan
Student ID: 162680235
Date: March 4, 2025
Replit Web App URL: https://17ac6a10-0253-4f30-aeeb-174d7b4d5244-00-330nfyki0hg6u.kirk.replit.dev/
GitHub Repository URL: https://github.com/RajMaharjan-fen/web322-app
********************************************************************************/

const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const clientSessions = require("client-sessions");
const authData = require("./auth-service");
const storeService = require('./store-service');

const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Set up client sessions
app.use(clientSessions({
  cookieName: "session",
  secret: "yourSecretKey",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

// Make session available in views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Middleware to protect routes
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// Cloudinary setup
cloudinary.config({
  cloud_name: 'dbd1qlcof',
  api_key: '627917398641178',
  api_secret: 'D1Uqr5jg2f_Hnh3nByoicSqYTSQ',
  secure: true
});

const upload = multer();

// Route helpers
app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Public Routes
app.get('/', (req, res) => res.redirect('/shop'));

app.get('/about', (req, res) => {
  res.render('about', { title: "Raj Maharjan's Store" });
});

app.get('/shop', (req, res) => {
  const category = req.query.category;
  if (category) {
    storeService.getPublishedItemsByCategory(category)
      .then(posts => {
        const post = posts[0];
        res.render('shop', { title: "Shop - Raj Maharjan's Store", post, posts, categories: [], message: null, viewingCategory: category });
      })
      .catch(err => res.render('shop', { title: "Shop - Raj Maharjan's Store", post: null, posts: [], categories: [], message: "No results returned", viewingCategory: category }));
  } else {
    storeService.getPublishedItems()
      .then(posts => {
        const post = posts[0];
        storeService.getCategories()
          .then(categories => {
            res.render('shop', { title: "Shop - Raj Maharjan's Store", post, posts, categories, message: null, viewingCategory: null });
          });
      })
      .catch(err => res.render('shop', { title: "Shop - Raj Maharjan's Store", post: null, posts: [], categories: [], message: "No results returned", viewingCategory: null }));
  }
});

app.get('/shop/:id', (req, res) => {
  const id = req.params.id;
  storeService.getItemById(id)
    .then(post => {
      storeService.getPublishedItems()
        .then(posts => {
          storeService.getCategories()
            .then(categories => {
              res.render('shop', { title: "Shop - Raj Maharjan's Store", post, posts, categories, message: null, viewingCategory: req.query.category });
            });
        });
    })
    .catch(err => res.render('shop', { title: "Shop - Raj Maharjan's Store", post: null, posts: [], categories: [], message: "No results returned", viewingCategory: req.query.category }));
});

// Protected Routes (use ensureLogin)

app.get('/items', ensureLogin, (req, res) => {
  storeService.getAllItems()
    .then(items => res.render('items', { title: "Items - Raj Maharjan's Store", items, message: null }))
    .catch(err => res.render('items', { title: "Items - Raj Maharjan's Store", items: [], message: "No results returned" }));
});

app.get("/item/:id", ensureLogin, (req, res) => {
  storeService.getItemById(req.params.id)
    .then(data => res.render('item', { title: "Item Details - Raj Maharjan's Store", item: data }))
    .catch(err => res.render('item', { title: "Item Details - Raj Maharjan's Store", item: null, message: "No results returned" }));
});

app.get('/categories', ensureLogin, (req, res) => {
  storeService.getCategories()
    .then(categories => res.render('categories', { title: "Categories - Raj Maharjan's Store", categories, message: null }))
    .catch(err => res.render('categories', { title: "Categories - Raj Maharjan's Store", categories: [], message: "No results returned" }));
});

app.get("/category/add", ensureLogin, (req, res) => {
  res.render("addCategory", { title: "Add Category - Raj Maharjan’s Store" });
});

app.post("/category/add", ensureLogin, async (req, res) => {
  try {
    await storeService.addCategory(req.body);
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Error adding category: " + err);
  }
});

app.get("/items/add", ensureLogin, (req, res) => {
    storeService.getCategories()
      .then((categories) => {
        res.render("addItem", {
          title: "Add Item - Raj Maharjan's Store",
          categories 
        });
      })
      .catch(() => {
        res.render("addItem", {
          title: "Add Item - Raj Maharjan's Store",
          categories: [] 
        });
      });
  });
  
app.post("/items/add", ensureLogin, upload.single("featureImage"), async (req, res) => {
    let imageUrl = "";
  
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
        imageUrl = result.url;
      } catch (err) {
        console.error("Error uploading image:", err);
        return res.status(500).send("Image upload failed");
      }
    }
  
    req.body.featureImage = imageUrl;
    req.body.published = req.body.published ? true : false;
    req.body.postDate = new Date().toISOString(); 
    
    console.log("Adding item with data:", req.body);
    
  
    storeService.addItem(req.body)
      .then(() => res.redirect("/items"))
      .catch(err => {
        console.error("Error adding item:", err); 
        res.status(500).send("Error adding item: " + err);
      });
  });
  
app.get("/items/delete/:id", ensureLogin, async (req, res) => {
  try {
    await storeService.deletePostById(req.params.id);
    res.redirect("/items");
  } catch (err) {
    res.status(500).send("Error deleting item: " + err);
  }
});

app.get("/category/delete/:id", ensureLogin, async (req, res) => {
  try {
    await storeService.deleteCategoryById(req.params.id);
    res.redirect("/categories");
  } catch (err) {
    res.status(500).send("Error deleting category: " + err);
  }
});

// Auth Routes

app.get("/login", (req, res) => {
  res.render("login", {
    userName: "",
    errorMessage: null
  });
});

app.get("/register", (req, res) => {
    res.render("register", {
      successMessage: null,
      errorMessage: null,
      userName: "",
      email: ""
    });
  });
  
  app.post("/register", async (req, res) => {
    const { userName, password, password2, email } = req.body;
  
    if (password !== password2) {
      return res.render("register", {
        userName,
        email,
        errorMessage: "Passwords do not match.",
        successMessage: null
      });
    }
  
    try {
      await authData.registerUser(req.body);
      res.render("register", {
        userName: "",
        email: "",
        errorMessage: null,
        successMessage: "User created"
      });
    } catch (err) {
      res.render("register", {
        userName,
        email,
        errorMessage: err,
        successMessage: null
      });
    }
  });
  
  

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData.checkUser(req.body).then((user) => {
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    };
    res.redirect("/items");
  }).catch((err) => {
    res.render("login", { errorMessage: err, userName: req.body.userName });
  });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});


app.use((req, res) => {
  res.status(404).render('404', { title: "404 - Raj Maharjan's Store" });
});

// Start server
storeService.initialize()
  .then(() => {
    return authData.initialize();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log("Error initializing services:", err);
  });

  