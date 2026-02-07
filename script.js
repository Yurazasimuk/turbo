document.addEventListener('DOMContentLoaded', () => {

    // ==============================================
    // 0. БАЗА ДАНИХ (ПРАВИЛЬНІ КАРТИНКИ)
    // ==============================================
    const productsData = [
        { id: 1, title: "Motul 8100 X-cess 5W-40 (5L)", price: "1 850", img: "https://m.media-amazon.com/images/I/71p-Ie9rCjL._AC_SL1500_.jpg" },
        { id: 2, title: "Bosch Oil Filter P3030", price: "320", img: "https://m.media-amazon.com/images/I/71N+DK3IeHL._AC_SL1500_.jpg" },
        { id: 3, title: "Brembo Brake Pads Set", price: "2 100", img: "https://m.media-amazon.com/images/I/81aiH7-rEEL._AC_SL1500_.jpg" },
        { id: 4, title: "Varta Blue Dynamic D24", price: "3 400", img: "https://m.media-amazon.com/images/I/51f+3wLqVIL._AC_SL1000_.jpg" },
        { id: 5, title: "Амортизатор KYB Excel-G", price: "1 650", img: "https://m.media-amazon.com/images/I/61M6y-iCqJL._AC_SL1500_.jpg" }
    ];

    // ==============================================
    // 1. ЗАПУСК (ПЕРЕВІРКА СТОРІНКИ)
    // ==============================================

    updateUserInterface(); // Оновити шапку (вхід/вихід)
    updateCartCount();     // Оновити лічильник кошика
    initMobileMenu();      // Запустити меню для мобільних
    initAnimations();      // Запустити анімацію появи
    initModal();           // Запустити логіку модальних вікон

    // --- ЛОГІКА ДЛЯ РІЗНИХ СТОРІНОК ---

    // 1. Якщо це сторінка ВХОДУ (Login)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 2. Якщо це сторінка РЕЄСТРАЦІЇ (Register)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // 3. Якщо це КАТАЛОГ (Catalog)
    if (document.getElementById('category-filters')) {
        initFilters();
    }

    // 4. Якщо це КОШИК (Cart)
    if (document.getElementById('cart-items-container')) {
        renderCart();
        initCheckout();
    }

    // 5. Якщо це СТОРІНКА ТОВАРУ (Product)
    if (document.getElementById('p-title')) {
        initProductPage(productsData);
    }
});

// ==============================================
// ФУНКЦІЇ АВТОРИЗАЦІЇ (РЕЄСТРАЦІЯ / ВХІД)
// ==============================================

function handleRegister(e) {
    e.preventDefault();

    // Отримуємо дані з полів (перевір, щоб id в HTML збігалися)
    const name = document.querySelector('input[type="text"]').value;
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    if(name && email && password) {
        // Зберігаємо користувача в "базу" (LocalStorage)
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Перевірка чи існує такий email
        if(users.find(u => u.email === email)) {
            alert("Цей email вже зареєстрований!");
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        alert("Реєстрація успішна! Тепер увійдіть.");
        window.location.href = 'login.html';
    } else {
        alert("Заповніть всі поля!");
    }
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const validUser = users.find(u => u.email === email && u.password === password);

    if (validUser) {
        localStorage.setItem('currentUser', JSON.stringify(validUser));
        window.location.href = 'index.html';
    } else {
        alert("Невірний логін або пароль!");
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function updateUserInterface() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const navLinks = document.querySelector('.nav-links');

    // Видаляємо старий пункт профілю, щоб не дублювався
    const oldUserMenu = document.getElementById('user-menu-item');
    if (oldUserMenu) oldUserMenu.remove();

    const li = document.createElement('li');
    li.id = 'user-menu-item';

    if (user) {
        // Якщо увійшов
        li.innerHTML = `
            <a href="cart.html" style="position:relative; margin-right:10px;">
                <i class="fa-solid fa-cart-shopping"></i>
                <span id="cart-badge" style="position:absolute; top:-8px; right:-10px; background:#ff5722; color:#fff; font-size:10px; padding:2px 6px; border-radius:50%; display:none;">0</span>
            </a> 
            <a href="#" onclick="logout()" style="color:#ff5722; font-weight:bold;">
                <i class="fa-solid fa-user"></i> ${user.name} (Вихід)
            </a>`;

        // Прибираємо посилання "Вхід", якщо воно є в меню статично
        const loginLink = document.querySelector('a[href="login.html"]');
        if(loginLink) loginLink.parentElement.style.display = 'none';

    } else {
        // Якщо гість
        li.innerHTML = `<a href="login.html"><i class="fa-regular fa-user"></i> Вхід</a>`;
    }
    navLinks.appendChild(li);
}

// ==============================================
// ФУНКЦІЇ КОШИКА
// ==============================================

function addToCart(title, price, img) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.title === title);
    if (existing) { existing.qty += 1; }
    else { cart.push({ title, price, img, qty: 1 }); }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert("Товар додано в кошик!");
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        badge.innerText = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalBox = document.getElementById('cart-total-box');
    const finalPrice = document.getElementById('final-price');
    if(!container) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#fff;"><h2>Кошик порожній</h2><a href="catalog.html" class="buy-btn" style="margin-top:20px; display:inline-block; text-decoration:none;">У КАТАЛОГ</a></div>';
        if(totalBox) totalBox.style.display = 'none';
        return;
    }

    if(totalBox) totalBox.style.display = 'block';

    let html = `<table class="cart-table"><thead><tr><th>Фото</th><th>Товар</th><th>Ціна</th><th>К-сть</th><th></th></tr></thead><tbody>`;
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        html += `<tr>
            <td><img src="${item.img}" style="width:50px; border-radius:4px;"></td>
            <td>${item.title}</td>
            <td>${item.price} грн</td>
            <td><input type="number" min="1" value="${item.qty}" onchange="changeQty(${index}, this.value)" style="width:50px; padding:5px;"></td>
            <td><i class="fa-solid fa-trash" style="color:#ff4444; cursor:pointer;" onclick="removeFromCart(${index})"></i></td>
        </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
    if(finalPrice) finalPrice.innerText = total;
}

function changeQty(index, qty) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart[index].qty = parseInt(qty) > 0 ? parseInt(qty) : 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

// ==============================================
// ОФОРМЛЕННЯ ЗАМОВЛЕННЯ (МОДАЛКА)
// ==============================================

function initModal() {
    const modal = document.getElementById('modal');
    const openBtns = document.querySelectorAll('.open-modal');
    const closeBtn = document.querySelector('.close-btn');

    if(modal) {
        // Відкриття кнопок "Записатись" на СТО
        if(openBtns.length) {
            openBtns.forEach(btn => btn.addEventListener('click', () => modal.style.display = 'flex'));
        }
        // Закриття на хрестик
        if(closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        // Закриття по кліку повз вікно
        window.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = 'none'; });

        // Форма в модалці "Передзвоніть мені"
        const modalForm = document.getElementById('modalForm');
        if(modalForm) {
            modalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Дякуємо! Ми зателефонуємо вам.");
                modal.style.display = 'none';
            });
        }
    }
}

function initCheckout() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const modal = document.getElementById('modal');

    // Кнопка "Оформити замовлення" в кошику
    if (checkoutBtn && modal) {
        checkoutBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // Форма підтвердження замовлення (всередині модалки)
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('orderName').value;

            // Очищення кошика після замовлення
            localStorage.removeItem('cart');

            alert(`Дякуємо, ${name}! Ваше замовлення прийнято.`);
            window.location.href = 'index.html';
        });
    }
}

// ==============================================
// ФІЛЬТРИ ТА ІНШЕ
// ==============================================

function initFilters() {
    const categoryLinks = document.querySelectorAll('#category-filters a');
    const brandCheckboxes = document.querySelectorAll('.brand-filter');
    const filterBtn = document.querySelector('.filter-btn');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            applyFilters();
        });
    });

    if(brandCheckboxes.length) {
        brandCheckboxes.forEach(box => box.addEventListener('change', applyFilters));
    }
    if(filterBtn) filterBtn.addEventListener('click', applyFilters);
}

function applyFilters() {
    const activeLink = document.querySelector('#category-filters .active');
    const activeCategory = activeLink ? activeLink.getAttribute('data-filter') : 'all';
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');

    const minPrice = minInput ? (parseFloat(minInput.value) || 0) : 0;
    const maxPrice = maxInput ? (parseFloat(maxInput.value) || 999999) : 999999;

    const selectedBrands = Array.from(document.querySelectorAll('.brand-filter'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    document.querySelectorAll('.product-card').forEach(card => {
        const cardCat = card.getAttribute('data-category');
        const cardBrand = card.getAttribute('data-brand');
        const cardPrice = parseFloat(card.getAttribute('data-price'));

        const matchCat = (activeCategory === 'all' || activeCategory === cardCat);
        const matchPrice = (cardPrice >= minPrice && cardPrice <= maxPrice);
        const matchBrand = (selectedBrands.length === 0 || selectedBrands.includes(cardBrand));

        card.style.display = (matchCat && matchPrice && matchBrand) ? 'flex' : 'none';
    });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if(menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => { navLinks.classList.toggle('active'); });
    }
}

function initAnimations() {
    const hiddenElements = document.querySelectorAll('.hidden');
    if (hiddenElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        });
        hiddenElements.forEach(el => observer.observe(el));
    }
}

function initProductPage(data) {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if(idParam) {
        const productId = parseInt(idParam);
        const product = data.find(p => p.id === productId);
        if (product) {
            document.getElementById('p-title').innerText = product.title;
            document.getElementById('p-price').innerText = product.price + " ₴";
            const mainImg = document.getElementById('mainImg');
            if(mainImg) mainImg.src = product.img;

            const buyBtn = document.querySelector('.buy-btn');
            if(buyBtn) {
                const rawPrice = parseInt(product.price.replace(/\s/g, ''));
                buyBtn.onclick = () => addToCart(product.title, rawPrice, product.img);
                buyBtn.innerText = "ДОДАТИ В КОШИК";
            }
        }
    }
}