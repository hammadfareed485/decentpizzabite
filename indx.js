// High Quality Images for Menu
const products = [
    { id: 1, name: 'Special Pizza', price: 1200, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
    { id: 2, name: 'Zinger Burger', price: 450, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
    { id: 3, name: 'Chicken Burger', price: 300, img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500' },
    { id: 4, name: 'Simple Burger', price: 200, img: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500' },
    { id: 5, name: 'Chicken Samosa', price: 150, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500' },
    { id: 6, name: 'Simple Samosa', price: 100, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500' },
    { id: 7, name: 'Daibla (Dahi Bhalla)', price: 200, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500' },
    { id: 8, name: 'Hot Wings', price: 350, img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500' },
    { id: 9, name: 'Chicken Nuggets', price: 300, img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500' },
    { id: 10, name: 'Shawarma', price: 250, img: 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?w=500' }
];

// Load Cart from LocalStorage or create empty array
let cart = JSON.parse(localStorage.getItem('pizza_cart')) || [];

// 1. Render Menu on Page Load
function renderMenu() {
    const menuGrid = document.getElementById('menu-grid');
    products.forEach(item => {
        menuGrid.innerHTML += `
            <div class="food-card">
                <img src="${item.img}" alt="${item.name}">
                <div class="food-info">
                    <h3>${item.name}</h3>
                    <span class="price">Rs. ${item.price}</span>
                    <button class="add-to-cart" onclick="addToCart(${item.id})">Add to Order</button>
                </div>
            </div>
        `;
    });
}

// 2. Add Item to Cart
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existingItem = cart.find(c => c.id === id);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    
    saveCartAndRender();
    showToast();
}

// 3. Change Quantity (Plus / Minus)
function changeQty(id, amount) {
    const item = cart.find(c => c.id === id);
    if(item) {
        item.qty += amount;
        if(item.qty <= 0) {
            cart = cart.filter(c => c.id !== id); // Remove item if qty is 0
        }
        saveCartAndRender();
    }
}

// 4. Save to Storage & Update UI
function saveCartAndRender() {
    localStorage.setItem('pizza_cart', JSON.stringify(cart));
    updateCartUI();
}

// 5. Update Cart Sidebar UI
function updateCartUI() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotal = document.getElementById('cart-total');

    cartItemsDiv.innerHTML = '';
    let totalAmount = 0;
    let totalItems = 0;

    if(cart.length === 0) {
        cartItemsDiv.innerHTML = '<p style="text-align:center; color:#A0A0A0; margin-top: 50px;">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            let itemSubtotal = item.price * item.qty;
            totalAmount += itemSubtotal;
            totalItems += item.qty;

            cartItemsDiv.innerHTML += `
                <div class="cart-item">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>Rs. ${itemSubtotal}</p>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    </div>
                </div>
            `;
        });
    }

    cartBadge.innerText = totalItems;
    cartTotal.innerText = totalAmount;
}

// 6. Sidebar Toggle Logic
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    sidebar.classList.toggle('active');
    if(sidebar.classList.contains('active')) {
        overlay.style.display = 'block';
        setTimeout(() => overlay.style.opacity = '1', 10);
    } else {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 300);
    }
}

// 7. Toast Notification Logic
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

// 8. Checkout & Location Tracking
function processCheckout() {
    if (cart.length === 0) return alert("Please add some items to your cart first.");

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.innerText = "Tracking Location..."; // User feedback

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => sendOrderWhatsApp(position), 
            (error) => {
                alert("Location not allowed. Proceeding without live location.");
                sendOrderWhatsApp(null); // Proceed even if location fails
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    } else {
        sendOrderWhatsApp(null);
    }
}

// 9. WhatsApp Order Formatter
function sendOrderWhatsApp(position) {
    let mapUrl = "Location not provided";
    if (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    }

    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const total = document.getElementById('cart-total').innerText;

    let msg = `*--- DECENT PIZZA LAB ---*\n`;
    msg += `*Order ID:* ${orderId}\n\n`;
    msg += `*Order Items:*\n`;
    
    cart.forEach(i => {
        msg += `▪ ${i.name} (x${i.qty}) = Rs. ${i.price * i.qty}\n`;
    });
    
    msg += `\n*Grand Total:* Rs. ${total}\n`;
    msg += `*Customer Location:* ${mapUrl}`;

    // Clear cart after order is prepared
    cart = [];
    saveCartAndRender();
    toggleCart();

    // Apna Number Replace karein, bypass popup blocker
    const whatsappNumber = "923045518658"; 
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.location.href = whatsappUrl;
}

// Initialize the App
document.addEventListener("DOMContentLoaded", () => {
    renderMenu();
    updateCartUI();
});