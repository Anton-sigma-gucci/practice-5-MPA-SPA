"use strict";

/* ---------- Data ---------- */
const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

const PRODUCTS = [
  { id: 1, name: "Nova X Smartphone", category: "Smartphones", price: 899, popular: true, image: img("photo-1511707171634-5f897ff02aa9") },
  { id: 2, name: "Pixel Edge 5G", category: "Smartphones", price: 749, image: img("photo-1598327105666-5b89351aff97") },
  { id: 3, name: "Aero Pro 14 Laptop", category: "Laptops", price: 1499, popular: true, image: img("photo-1517336714731-489689fd1ca8") },
  { id: 4, name: "Slate 15 Ultrabook", category: "Laptops", price: 1099, image: img("photo-1593642632823-8f785ba67e45") },
  { id: 5, name: "Studio Wireless Headphones", category: "Headphones", price: 299, popular: true, image: img("photo-1505740420928-5e560c06d30e") },
  { id: 6, name: "Pulse Over-Ear Headphones", category: "Headphones", price: 199, image: img("photo-1583394838336-acd977736f90") },
  { id: 7, name: "Orbit Smartwatch", category: "Accessories", price: 249, popular: true, image: img("photo-1546868871-7041f2a55e12") },
  { id: 8, name: "Glide Wireless Mouse", category: "Accessories", price: 59, image: img("photo-1527864550417-7fd91fc51a46") },
  { id: 9, name: "Mech Pro Keyboard", category: "Accessories", price: 129, image: img("photo-1587829741301-dc798b83add3") },
  { id: 10, name: "Nova Mini Smartphone", category: "Smartphones", price: 529, image: img("photo-1610945415295-d9bbf067e59c") }
];

const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#191F29"/>' +
  '<text x="50%" y="50%" fill="#929BAA" font-family="sans-serif" font-size="22" text-anchor="middle">Image unavailable</text></svg>'
);

const ROUTES = ["home", "catalog", "about", "contact"];
const DEFAULT_ROUTE = "home";

/* ---------- State ---------- */
const favorites = new Set();
const filters = { query: "", category: "All" };
let sessionSeconds = 0;
let sessionTimerId = null;

/* ---------- DOM references ---------- */
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav a");
const popularGrid = document.querySelector("#popular-grid");
const catalogGrid = document.querySelector("#catalog-grid");
const emptyMsg = document.querySelector("#empty-msg");
const searchInput = document.querySelector("#search-input");
const categoriesBox = document.querySelector("#categories");
const favCount = document.querySelector("#fav-count");
const timerEl = document.querySelector("#session-timer");
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

/* ---------- Routing (hash) ---------- */
function getRoute() {
  const name = window.location.hash.replace(/^#\/?/, "");
  return ROUTES.includes(name) ? name : DEFAULT_ROUTE;
}

function renderRoute() {
  const route = getRoute();
  pages.forEach((page) => page.classList.toggle("active", page.dataset.page === route));
  navLinks.forEach((link) => {
    const isActive = link.dataset.route === route;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  window.scrollTo(0, 0);
}

function navigate(route) {
  window.location.hash = "#/" + route;
}

/* ---------- Product cards ---------- */
function createCard(product) {
  const card = document.createElement("article");
  card.className = "card";

  const imgWrap = document.createElement("div");
  imgWrap.className = "card-img";
  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.name;
  image.loading = "lazy";
  image.addEventListener("error", () => { image.src = FALLBACK_IMG; }, { once: true });
  imgWrap.appendChild(image);

  const title = document.createElement("h3");
  title.textContent = product.name;

  const cat = document.createElement("p");
  cat.className = "cat-label";
  cat.textContent = product.category;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = "$" + product.price.toLocaleString("en-US");

  const fav = document.createElement("button");
  fav.type = "button";
  fav.className = "fav-btn";
  fav.dataset.fav = product.id;
  card.append(imgWrap, title, cat, price, fav);
  setFavButton(fav, favorites.has(product.id), product.name);
  return card;
}

function setFavButton(btn, isFav, name) {
  btn.classList.toggle("active", isFav);
  btn.textContent = isFav ? "♥" : "♡";
  btn.setAttribute("aria-pressed", String(isFav));
  const productName = name || PRODUCTS.find((p) => p.id === Number(btn.dataset.fav)).name;
  btn.setAttribute("aria-label", (isFav ? "Remove from favorites: " : "Add to favorites: ") + productName);
}

function renderGrid(grid, list) {
  grid.replaceChildren(...list.map(createCard));
}

function getFilteredProducts() {
  const q = filters.query.trim().toLowerCase();
  return PRODUCTS.filter((p) =>
    (filters.category === "All" || p.category === filters.category) &&
    p.name.toLowerCase().includes(q)
  );
}

function renderCatalog() {
  const list = getFilteredProducts();
  renderGrid(catalogGrid, list);
  emptyMsg.classList.toggle("hidden", list.length > 0);
}

/* ---------- Favorites ---------- */
function toggleFavorite(id) {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  document.querySelectorAll(`[data-fav="${id}"]`).forEach((btn) => setFavButton(btn, favorites.has(id)));
  favCount.textContent = favorites.size;
}

/* ---------- Session timer ---------- */
function formatTime(total) {
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function startSessionTimer() {
  if (sessionTimerId !== null) return; // only one interval for the whole session
  sessionTimerId = window.setInterval(() => {
    sessionSeconds += 1;
    timerEl.textContent = formatTime(sessionSeconds);
  }, 1000);
}

/* ---------- Events ---------- */
window.addEventListener("hashchange", renderRoute);

document.querySelector("#explore-btn").addEventListener("click", () => navigate("catalog"));

// Event delegation: favorite buttons in both grids
document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-fav]");
  if (btn) toggleFavorite(Number(btn.dataset.fav));
});

// Event delegation: category sidebar
categoriesBox.addEventListener("click", (event) => {
  const btn = event.target.closest(".cat");
  if (!btn) return;
  filters.category = btn.dataset.category;
  categoriesBox.querySelectorAll(".cat").forEach((el) => el.classList.toggle("active", el === btn));
  renderCatalog();
});

searchInput.addEventListener("input", () => {
  filters.query = searchInput.value;
  renderCatalog();
  if (getRoute() !== "catalog") navigate("catalog");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.reset();
  formStatus.classList.remove("hidden");
  window.setTimeout(() => formStatus.classList.add("hidden"), 5000);
});

// Fallback for static images (hero)
document.querySelectorAll("img[data-fallback]").forEach((image) => {
  image.addEventListener("error", () => { image.src = FALLBACK_IMG; }, { once: true });
});

/* ---------- Init ---------- */
renderGrid(popularGrid, PRODUCTS.filter((p) => p.popular).slice(0, 4));
renderCatalog();
if (!window.location.hash) window.location.hash = "#/" + DEFAULT_ROUTE;
renderRoute();
startSessionTimer();