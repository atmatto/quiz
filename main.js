import { permutacja, reset, dodajElement, komentarz } from "./pomocnicze.js";

const liczbaPytan = 5;

let kategorie = [];

// Wyświetla listę kategorii użytkownikowi
let wyswietlKategorie = () => {
    reset();
    for (let i = 0; i < kategorie.length; i++) {
        dodajElement("a", kategorie[i].nazwa, { href: "#" + kategorie[i].id }); // po kliknięciu linku otwiera się quiz
    }

    komentarz("Użytkownik ma do wyboru kategorie. Po kliknięciu którejś z nich, fragment adresu strony (czyli tekst po znaku \"#\") zmieni się na identyfikator danej kategorii.");
}

// Ta funkcja wyświetla pierwsze z pozostałych pytań.
// Po kliknięciu przycisku odpowiedzi, ta funkcja jest uruchamiana
// ponownie, ale nowe `pozostalePytania` nie zawierają już
// obecnego pytania.
let wyswietlPytanie = (kategoria, pozostalePytania, wynik, maksymalnyWynik) => {
    reset();
    dodajElement("a", "Powrót", { href: "#" }); // Powrót do listy kategorii

    let pytanie = pozostalePytania[0]; // Pierwsze z pozostałych pytań

    dodajElement("h1", kategoria.nazwa);
    dodajElement("p", "Wynik: " + wynik + "/" + (maksymalnyWynik - pozostalePytania.length));

    if (pytanie === undefined) { // Skończyły się pytania
        dodajElement("p", "Koniec :)");
        komentarz("Gdy skończą się pytania, użytkownik może powrócić do listy kategorii.");
        return;
    }

    dodajElement("h2", pytanie.pytanie);

    for (let odpowiedz of pytanie.odpowiedzi) { // Dodawanie przycisków odpowiedzi
        // W przypadku złej odpowiedzi przesuwamy obecne pytanie na koniec
        let funkcja = () => wyswietlPytanie(kategoria, [...pozostalePytania.slice(1), pytanie], wynik, ++maksymalnyWynik);

        if (odpowiedz[0] === "@") { // Prawidłowa odpowiedź
            odpowiedz = odpowiedz.slice(1); // ucinamy znak `@`
            funkcja = () => wyswietlPytanie(kategoria, pozostalePytania.slice(1), ++wynik, maksymalnyWynik);
        }

        dodajElement("button", odpowiedz, { onclick: funkcja });
    }

    komentarz("Wyświetla się pytanie i cztery odpowiedzi. Trzy z nich to losowo dobrane niepoprawne odpowiedzi. Są one wybrane spośród tłumaczeń innych słów. Losowo jest wybrany kierunek pytania - z polskiego na angielski lub odwrotnie. Po kliknięciu prawidłowej odpowiedzi dodawany jest punkt i przechodzimy do kolejnego pytania. Po kliknięciu złej odpowiedzi dane pytanie jest przesuwane na koniec listy pytań, dzięki czemu użytkownik będzie miał szansę się poprawić.");
}

// Gdy zmienia się fragment linku (tekst po `#`) otwieramy daną kategorię
let przygotujKategorie = () => {
    let idKategorii = location.hash.slice(1); // id kategorii to fragment od drugiego znaku (pomijamy `#`)
    if (idKategorii === "") { // brak wybranej kategorii
        wyswietlKategorie(); // wyświetlamy listę kategorii
        return;
    }

    let kategoria = kategorie.find(k => k.id === idKategorii); // znajdujemy kategorię po identyfikatorze
    if (kategoria === undefined) { // nieistniejąca kategoria
        wyswietlKategorie();
        return;
    }
    let pytania = permutacja(Object.entries(kategoria.slowa)).slice(0, liczbaPytan); // losujemy pytania

    let pozostalePytania = [];
    for (let i = 0; i < pytania.length; i++) {
        let kierunek = Math.random() < 0.5 ? true : false; // Losujemy kierunek dla danego pytania (en -> pl lub pl -> en)

        let pytanie = pytania[i][kierunek ? 0 : 1];
        // wybieramy możliwe nieprawidłowe odpowiedzi
        let nieprawidlowe = Object.entries(kategoria.slowa).filter(s => s[0] !== pytania[i][0]).map(s => s[kierunek ? 1 : 0]);
        // wybieramy trzy losowe nieprawidłowe
        nieprawidlowe = permutacja(nieprawidlowe).slice(0, 3);
        let prawidlowa = pytania[i][kierunek ? 1 : 0];

        // 4 odpowiedzi w losowej kolejności; prawidłowa jest zaznaczona znakiem `@`
        let odpowiedzi = permutacja(["@" + prawidlowa, ...nieprawidlowe]);

        pozostalePytania.push({ pytanie, odpowiedzi });
    }

    wyswietlPytanie(kategoria, pozostalePytania, 0, liczbaPytan);
}
window.onhashchange = przygotujKategorie; // Zmiana fragmentu linku (tekstu po `#`)

// Ładowanie kategorii i pytań
fetch("pytania.json")
    .then(r => r.json()) // Czytanie JSON
    .then(j => j.kategorie) // Wyjmujemy kategorie
    .then(kat => { kategorie = kat; }) // Zapisujemy je jako zmienna
    .then(wyswietlKategorie) // Wyświetlamy listę kategorii
    .then(przygotujKategorie); // Na wypadek gdyby użytkownik użył linku z już wybraną
                               // kategorią (jeżeli tak nie było, to ta funkcja nic nie robi)
