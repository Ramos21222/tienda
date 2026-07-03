/* ============================================================
   SHARED SHOPPING CART
   Loaded by every page (catalog, the 4 product pages, and
   checkout.html) via <script src="cart.js"></script>.
   There is no backend — the cart is just an array of items kept
   in localStorage under CART_KEY, so it survives navigating
   between pages but is local to this browser only.
   ============================================================ */
const CART_KEY = 'drittei_cart';

// read the cart array out of localStorage (empty array if missing/corrupt)
function cartGet(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}

// write the cart array back to localStorage and refresh every "Bolsa (N)" badge on the page
function cartSave(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  cartUpdateBadge();
}

// add an item to the cart. item = {id, title, price, image, size, href}
// adding the same product+size again just bumps its quantity instead of duplicating the row
function cartAdd(item){
  const cart = cartGet();
  const existing = cart.find(c => c.id === item.id && c.size === item.size);
  if (existing) existing.qty += (item.qty || 1);
  else cart.push(Object.assign({ qty: 1 }, item));
  cartSave(cart);
}

function cartRemove(id, size){
  cartSave(cartGet().filter(c => !(c.id === id && c.size === size)));
}

function cartSetQty(id, size, qty){
  const cart = cartGet();
  const item = cart.find(c => c.id === id && c.size === size);
  if (!item) return;
  item.qty = Math.max(1, qty);
  cartSave(cart);
}

// the sizes offered on every product page (kept here too so checkout's size dropdown can reuse the same list)
const SIZES = ['XS','S','M','L','XL'];

// change the size of an existing cart line; if that size is already a separate line, merge quantities into it
function cartSetSize(id, oldSize, newSize){
  const cart = cartGet();
  const item = cart.find(c => c.id === id && c.size === oldSize);
  if (!item) return;
  const existing = cart.find(c => c.id === id && c.size === newSize && c !== item);
  if (existing) {
    existing.qty += item.qty;
    cartSave(cart.filter(c => c !== item));
  } else {
    item.size = newSize;
    cartSave(cart);
  }
}

// "save for later" list: a second, separate array in localStorage so items can move out of the cart without being lost
const SAVED_KEY = 'drittei_saved';
function savedGet(){
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; }
  catch(e){ return []; }
}
function savedSave(list){
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}
function cartSaveForLater(id, size){
  const cart = cartGet();
  const item = cart.find(c => c.id === id && c.size === size);
  if (!item) return;
  savedSave([...savedGet(), item]);
  cartSave(cart.filter(c => c !== item));
}
function cartMoveToCart(id, size){
  const saved = savedGet();
  const item = saved.find(c => c.id === id && c.size === size);
  if (!item) return;
  savedSave(saved.filter(c => c !== item));
  cartAdd(item);
}
function savedRemove(id, size){
  savedSave(savedGet().filter(c => !(c.id === id && c.size === size)));
}

// prices on this site are written like "$0.000" (dot as thousands separator) — keep only the digits
function cartParsePrice(priceText){
  const digits = (priceText || '').replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}
function cartFormatPrice(n){
  return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function cartCount(cart){
  return (cart || cartGet()).reduce((sum, c) => sum + c.qty, 0);
}
function cartTotal(cart){
  return (cart || cartGet()).reduce((sum, c) => sum + cartParsePrice(c.price) * c.qty, 0);
}

// updates every element with class "bag" (the header link) to show the current item count
function cartUpdateBadge(){
  const n = cartCount();
  document.querySelectorAll('.bag').forEach(el => { el.textContent = `Bolsa (${n})`; });
}

document.addEventListener('DOMContentLoaded', cartUpdateBadge);
