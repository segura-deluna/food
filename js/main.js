"use strict";

const cartButton = document.querySelector("#cart-button"),
	modal = document.querySelector(".modal"),
	close = document.querySelector(".close"),
	buttonAuth = document.querySelector('.button-auth'),
	modalAuth = document.querySelector('.modal-auth'),
	closeAuth = document.querySelector('.close-auth'),
	logInForm = document.querySelector('#logInForm'),
	loginInput = document.querySelector('#login'),
	userName = document.querySelector('.user-name'),
	buttonOut = document.querySelector('.button-out'),
	cardsRestaurants = document.querySelector('.cards-restaurants'),
	containerPromo = document.querySelector('.container-promo'),
	restaurants = document.querySelector('.restaurants'),
	menu = document.querySelector('.menu'),
	logo = document.querySelector('.logo'),
	cardsMenu = document.querySelector('.cards-menu'),
	restaurantTitle = document.querySelector('.restaurant-title'),
	rating = document.querySelector('.rating'),
	minPrice = document.querySelector('.price'),
	category = document.querySelector('.category'),
	inputSearch = document.querySelector('.input-search');

let login = localStorage.getItem('Food');


const getData = async function (url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`
			Ошибка по адресу ${url},
			статус: ошибка ${response.status}!
		`);
	}
	return await response.json();
};


const valid = function (str) {
	const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
	return nameReg.test(str);
}
valid();


// * Переключение видимости модального окна
function toggleModal() {
	modal.classList.toggle("is-open");
}

function toggleModalAuth() {
	loginInput.style.borderColor = '';
	modalAuth.classList.toggle('is-open');
}

function returnMain() {
	containerPromo.classList.remove('hide');
	restaurants.classList.remove('hide');
	menu.classList.add('hide');
}


// * Проверка авторизации пользователя
function autorized() {

	function logOut() {
		login = null;
		localStorage.removeItem('Food');
		buttonAuth.style.display = '';
		userName.style.display = '';
		buttonOut.style.display = '';
		buttonOut.removeEventListener('click', logOut);
		checkAuth();
		returnMain();
	}

	userName.textContent = login;
	buttonOut.style.backgroundColor = 'red';
	buttonAuth.style.display = 'none';
	userName.style.display = 'inline';
	buttonOut.style.display = 'block';
	buttonOut.addEventListener('click', logOut);
}


function notAutorized() {

	function logIn(event) {
		event.preventDefault();

		if (valid(loginInput.value.trim())) {
			login = loginInput.value;
			localStorage.setItem('Food', login);
			toggleModalAuth();
			buttonAuth.removeEventListener('click', toggleModalAuth);
			closeAuth.removeEventListener('click', toggleModalAuth);
			logInForm.removeEventListener('submit', logIn);
			logInForm.reset();
			checkAuth();
		} else {
			loginInput.style.borderColor = 'tomato';
			loginInput.value = '';
		}
	}

	buttonAuth.addEventListener('click', toggleModalAuth);
	closeAuth.addEventListener('click', toggleModalAuth);
	logInForm.addEventListener('submit', logIn);
}


function checkAuth() {
	if (login) {
		autorized();
	} else {
		notAutorized();
	}
}


// * Рендеринг карточек
function createCardRestaurant({ image, kitchen, name, price, stars, products, time_of_delivery: timeOfDelivery }) {

	const card = `
		<a class="card card-restaurant" data-products="${products}" data-info="${[name, price, stars, kitchen]}">
			<img src="${image}" alt="image" class="card-image" />
			<div class="card-text">
				<div class="card-heading">
					<h3 class="card-title">${name}</h3>
					<span class="card-tag tag">${timeOfDelivery} мин</span>
				</div>
				<div class="card-info">
					<div class="rating">
						${stars}
					</div>
					<div class="price">От ${price} ₽</div>
					<div class="category">${kitchen}</div>
				</div>
			</div>
		</a>
	`;
	cardsRestaurants.insertAdjacentHTML('beforeend', card);
}


function createCardGood({ description, id, image, name, price }) {

	const card = document.createElement('div');
	card.className = 'card';

	card.insertAdjacentHTML('beforeend', `
		<img src="${image}" alt="image" class="card-image" />
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title card-title-reg">${name}</h3>
			</div>
			<div class="card-info">
				<div class="ingredients">${description}</div>
			</div>
			<div class="card-buttons">
				<button class="button button-primary button-add-cart">
					<span class="button-card-text">В корзину</span>
					<span class="button-cart-svg"></span>
				</button>
				<strong class="card-price-bold">${price} ₽</strong>
			</div>
		</div>
	`);
	cardsMenu.insertAdjacentElement('beforeend', card);
}


function openGoods(event) {

	const target = event.target;
	const restaurant = target.closest('.card-restaurant');

	if (restaurant) {

		const info = restaurant.dataset.info.split(',');
		const [name, price, stars, kitchen] = info;

		if (login) {
			cardsMenu.textContent = '';
			containerPromo.classList.add('hide');
			restaurants.classList.add('hide');
			menu.classList.remove('hide');

			restaurantTitle.textContent = name;
			rating.textContent = stars;
			minPrice.textContent = `От ${price} ₽`;
			category.textContent = kitchen;

			getData(`./db/${restaurant.dataset.products}`).then(function (data) {
				data.forEach(createCardGood);
			});
		} else {
			toggleModalAuth();
		}
	}
}


function init() {
	getData('./db/partners.json').then(function (data) {
		data.forEach(createCardRestaurant);
	});

	// * Слушатели событий
	cartButton.addEventListener("click", toggleModal);

	close.addEventListener("click", toggleModal);

	cardsRestaurants.addEventListener('click', openGoods);

	logo.addEventListener('click', returnMain);

	inputSearch.addEventListener('keydown', function (event) {
		if (event.keyCode === 13) {

			const target = event.target;
			const value = target.value.toLowerCase().trim();

			target.value = '';
			if (!value || value.length < 3) {
				target.style.backgroundColor = 'tomato';
				setTimeout(function () {
					target.style.backgroundColor = '';
				}, 2000);
				return;
			}

			const goods = [];

			getData('./db/partners.json').then(function (data) {

				const products = data.map(function (item) {
					return item.products;
				});

				products.forEach(function (product) {

					getData(`./db/${product}`)
						.then(function (data) {
							goods.push(...data);
							const searchGoods = goods.filter(function (item) {
								return item.name.toLowerCase().includes(value);
							});

							cardsMenu.textContent = '';
							containerPromo.classList.add('hide');
							restaurants.classList.add('hide');
							menu.classList.remove('hide');

							restaurantTitle.textContent = 'Результат поиска';
							rating.textContent = '';
							minPrice.textContent = '';
							category.textContent = '';

							return searchGoods;
						})
						.then(function (data) {
							data.forEach(createCardGood);
						})
				});

			});
		}
	});

	checkAuth();


	new Swiper('.swiper-container', {
		loop: true,
		autoplay: {
			delay: 3000,
		},
	});
}

init();