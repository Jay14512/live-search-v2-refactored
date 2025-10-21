// DOM-Elemente holen: Ort-Eingabefeld und die Vorschlagsliste
const ort = document.getElementById("ort");
const plz = document.getElementById("plz");
const button = document.getElementById("coordinates");
const longitude = document.getElementById("länge");
const latitude = document.getElementById("breite");
const suggestions = document.getElementById("suggestions");
const resetFields = document.getElementById("resetFields");

resetFields.addEventListener("click", function (ev) {
    ort.value = "";
    plz.value = "";
    longitude.value = "";
    latitude.value = "";
    suggestions.innerHTML = "";
})

function clearCoordinates() {
    longitude.value = "";
    latitude.value = "";
}

function clearPlz() {
    plz.value = "";
}

// Sobald der Benutzer etwas ins Ort-Feld eingibt:
ort.addEventListener("input", function (ev) {
    clearCoordinates();
    clearPlz();
    // API-Daten holen (Ortsnamen + PLZs)
    fetch(`http://wifi.1av.at/getplz.php?json`)
        .then(response => response.json()) // JSON-Text in JS-Objekt umwandeln

        .then(data => {
            //  Neues Array bauen: jedes Objekt enthält Ort + zugehörige PLZ
            const orteMitPlz = [];
            Object.entries(data).forEach(([plz, orteArray]) => {
                orteArray.forEach(ort => {
                    orteMitPlz.push({ ort: ort, plz: plz });
                });
            });

            //  Zählen, wie oft jeder Ort vorkommt (z. B. Wien = 23×)
            const ortAnzahl = {};
            orteMitPlz.forEach(item => {
                ortAnzahl[item.ort] = (ortAnzahl[item.ort] || 0) + 1;
            });

            //  Eingabe vom Benutzer (z. B. "wi") in Kleinbuchstaben
            const input = ev.target.value.toLowerCase();

            //  Nur Orte filtern, die mit der Eingabe beginnen
            const matching = orteMitPlz.filter(item =>
                item.ort.toLowerCase().startsWith(input)
            );

            //  Falls keine Treffer oder Eingabe leer: Liste leeren + abbrechen
            if (matching.length === 0 || input === "") {
                suggestions.innerHTML = "";
                return;
            }

            //  Funktion: Zeigt Ort + PLZ nur, wenn Ort mehrfach vorkommt
            function formatOrt(item) {
                if (ortAnzahl[item.ort] > 1) {
                    return `${item.ort} (${item.plz})`;
                } else {
                    return item.ort;
                }
            }

            //HTML für die Vorschlagsliste aufbauen, inkl. data-Attribute
            let html = "";
            matching.forEach(item => {
                html += `<li data-ort="${item.ort}" data-plz="${item.plz}">${formatOrt(item)}</li>`;
            });

            //Vorschläge in die Seite einfügen
            suggestions.innerHTML = `<ul>${html}</ul>`;

            //Alle <li>-Einträge holen (sie wurden gerade erzeugt)
            const listItems = suggestions.querySelectorAll("li");

            // Für jeden Vorschlag einen Klick-Event hinzufügen
            listItems.forEach(li => {
                li.addEventListener("click", function (ev) {
                    // - Ort ins Ort-Feld schreiben
                    ort.value = li.dataset.ort;
                    // - PLZ ins PLZ-Feld schreiben
                    plz.value = li.dataset.plz;
                    // - Vorschlagsliste ausblenden
                    suggestions.innerHTML = "";


                });
            });
        })

        // Fehlerbehandlung für API-Fehler
        .catch(error => console.error("Error: ", error));
});

//Hole die Web-API wenn der Button geklickt wurde
button.addEventListener("click", function (ev) {
    ev.preventDefault();
    if (plz.value === "") {
        console.error("Error: No value");
    } else {
        fetch(`http://api.zippopotam.us/AT/` + plz.value)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Koordinaten konnten nicht geladen werden");
                }
                return response.json();
            })
            .then(data => {
                longitude.value = data.places[0].longitude;
                latitude.value = data.places[0].latitude;
                return;
            })
            .catch(error => {
                console.error(error.message);
                alert("Der Server für die Koordinaten ist im Moment nicht erreichbar");
                clearCoordinates();
            });
    }
});

//Adde einen Event-Listener um das Vorschlagsfeld zuzumachen, wenn jemand außerhalb der Liste klickt
document.addEventListener("click", function (ev) {
    if (!ort.contains(ev.target) && !suggestions.contains(ev.target)) {
        suggestions.innerHTML = "";
    }
});