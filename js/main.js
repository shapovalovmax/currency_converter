"use strict";

const apiKey             = "6cna8kHsQxWXSL99z8ncXJ8Q3HjiiU7c";
const form               = document.getElementById("currency-converter");
const amountInput        = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect   = document.getElementById("to-currency");
const historyTableBody   = document.querySelector("tbody");
const clearHistoryButton = document.getElementById("clear-history");

let history = [];

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    try {
        const response = await fetch(`https://api.apilayer.com/exchangerates_data/convert?to=${toCurrency}&from=${fromCurrency}&amount=${amount}`, {
            method: 'GET',
            headers: {
                "apikey": apiKey
            }
        });
        const data = await response.json();

        if (data.error) {
            alert("Ошибка при получении данных. Пожалуйста, попробуйте позже.");
            return;
        }

        const convertedAmount = data.result;
        const resultSpan = document.getElementById("result-value");

        resultSpan.textContent = convertedAmount;

        history.unshift({ amount, fromCurrency, toCurrency, convertedAmount });

        updateHistoryTable();

        amountInput.value = "";
    } catch (error) {
        console.error("Произошла ошибка:", error);
        alert("Произошла ошибка при выполнении конвертации. Пожалуйста, попробуйте позже.");
    }
});

historyTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-button")) {
        const index = e.target.dataset.index;
        history.splice(index, 1);
        updateHistoryTable();
    }
});

clearHistoryButton.addEventListener("click", () => {
    history.length = 0;
    updateHistoryTable();
});

function updateHistoryTable() {
    historyTableBody.innerHTML = "";
    history.slice(0, 20).forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.amount}</td>
            <td>${item.fromCurrency}</td>
            <td>${item.toCurrency}</td>
            <td><button class="btn btn-danger btn-sm delete-button" data-index="${index}">Удалить</button></td>
        `;
        historyTableBody.appendChild(row);
    });

    localStorage.setItem("currencyConverterHistory", JSON.stringify(history));
}

populateCurrencyOptions();

async function populateCurrencyOptions() {

    const savedHistory = localStorage.getItem("currencyConverterHistory");
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryTable();
    }

    try {
        const response = await fetch("https://api.apilayer.com/exchangerates_data/latest?symbols=GBP,JPY,EUR,CZK,CHF,EGP,KZT,KRW,MDL,LTL&base=USD", {
            headers: {
                "apikey": apiKey
            }
        });
        const data = await response.json();

        if (data.error) {
            alert("Ошибка при получении данных о валютах. Пожалуйста, попробуйте позже.");
            return;
        }

        const currencyOptions = Object.keys(data.rates);

        const fromCurrencySelect = document.getElementById("from-currency");
        const toCurrencySelect = document.getElementById("to-currency");

        currencyOptions.forEach((currency) => {
            const option1 = new Option(currency, currency);
            const option2 = new Option(currency, currency);

            fromCurrencySelect.appendChild(option1);
            toCurrencySelect.appendChild(option2);
        });
    } catch (error) {
        console.error("Произошла ошибка:", error);
        alert("Произошла ошибка при получении данных о валютах. Пожалуйста, попробуйте позже.");
    }
}
