'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [ 
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-06-24T17:01:17.194Z',
    '2021-06-26T23:36:17.929Z',
    '2021-06-28T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
//Function
let currentAccount, timer;

//Create username
accounts.forEach(function (acc) {
  acc.username = acc.owner
    .toLowerCase()
    .split(' ')
    .map(text => text[0])
    .join('');
});

function startTimer() {
  let time = 300;

  const tick = function () {
    let minute = Math.trunc(time / 60);
    let second = time % 60;
    labelTimer.textContent = `${String(minute).padStart(2, 0)}:${String(
      second
    ).padStart(2, 0)}`;
    if (time === 0) { 
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }

    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

const formatCurr = function (
  value,
  locale = currentAccount.locale,
  currency = currentAccount.currency
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const formatDate = function (date1, locale) {
  const calcDayPassed = (date1, date2) =>
    Math.trunc(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  const dayPassed = calcDayPassed(date1, new Date());
  if (dayPassed === 0) {
    return 'today';
  } else if (dayPassed === 1) {
    return 'yesterday';
  } else if (dayPassed <= 7) {
    return `${dayPassed} days ago`;
  }
  return new Intl.DateTimeFormat(locale).format(date1);
};

const displayMovement = function (acc, sorted = false) {
  //Delete inner Html
  containerMovements.innerHTML = '';

  //Sorted by btn
  const movement_copy = sorted
    ? currentAccount.movements.slice().sort((a, b) => a - b)
    : currentAccount.movements.slice();

  //Loop through movement
  movement_copy.forEach(function (mov, i) {
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatDate(date, acc.locale);
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">2 ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formatCurr(mov)}</div>
  </div>`;
    //Add adjust html
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((accumulate, mov) => accumulate + mov, 0);
  labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency);
};

const displaySummary = function (acc) {
  //Calc income
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((accumulate, mov) => accumulate + mov, 0);
  labelSumIn.textContent = formatCurr(income);
  //Calc outcome
  const outcome = acc.movements
    .filter(mov => mov < 0)
    .reduce((accumulate, mov) => accumulate + mov, 0);
  labelSumOut.textContent = formatCurr(Math.abs(outcome));

  //Calc interest
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int > 1)
    .reduce((accumulate, int) => accumulate + int, 0);
  labelSumInterest.textContent = formatCurr(Math.abs(interest));
};

const updateUI = function (acc) {
  displayMovement(currentAccount);
  displaySummary(currentAccount);
  displayBalance(currentAccount);
};

//Event Handler
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  //Check amount
  const loan = Math.floor(+inputLoanAmount.value);
  if (loan > 0 && currentAccount.movements.some(mov => mov >= loan * 0.1)) {
    setTimeout(function () {
      //Push to array
      currentAccount.movements.push(loan);
      currentAccount.movementsDates.push(new Date().toISOString());

      //Update Ui
      updateUI(currentAccount);

      //Reset timer
      clearInterval(timer);
      timer = startTimer();
    }, 2500);
  }
  //Clear input
  inputLoanAmount.value = '';
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  const amount = +inputTransferAmount.value;
  //Check correct amount and account
  if (
    amount > 0 &&
    amount < currentAccount.balance &&
    receiver?.username !== currentAccount.username &&
    receiver
  ) {
    //Reset timer
    clearInterval(timer);
    timer = startTimer();

    //Push array both sent and receive account
    receiver.movements.push(amount);
    receiver.movementsDates.push(new Date().toISOString());

    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    //Update UI
    updateUI(currentAccount);
  }
  inputTransferTo.value = inputTransferAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  //Check correct

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    //Find and delete account
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    console.log(accounts);

    //Logout
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});

let sort = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovement(currentAccount, !sort);
  sort = !sort;
});

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  //Find account
  const loginUser = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //Check pin

  if (loginUser?.pin === +inputLoginPin.value) {
    //Change current user
    currentAccount = loginUser;

    //Change date
    const option = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    const date = new Date();
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      option
    ).format(date);

    //Start timer
    if (timer) clearInterval(timer);
    timer = startTimer();
    //Update UI
    updateUI(currentAccount);
    containerApp.style.opacity = 1;
    labelWelcome.textContent = `Welcome, ${currentAccount.owner.split(' ')[0]}`;
  }

  //Clear input
  inputLoginPin.value = inputLoginUsername.value = '';
  inputLoginPin.blur();
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
