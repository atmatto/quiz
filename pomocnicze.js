// FUNKCJE POMOCNICZE

let permutacja = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        // Zamieniamy wybrany element z innym losowo wybranym
        let r = i + Math.floor(Math.random() * (arr.length - i));
        [arr[i], arr[r]] = [arr[r], arr[i]];
    }
    return arr;
}

const main = document.getElementById("main");

// Czyszczenie zawartości strony
let reset = () => main.replaceChildren([]);

// Dodaje dany znacznik html do strony
let dodajElement = (typ, tekst, wlasciwosci = {}) => {
    let element = document.createElement(typ);
    element.textContent = tekst;
    for (const wlasciwosc of Object.entries(wlasciwosci)) {
        element[wlasciwosc[0]] = wlasciwosc[1];
    }
    main.appendChild(element);
}

let komentarz = k => dodajElement("aside", k);

export { permutacja, reset, dodajElement, komentarz };