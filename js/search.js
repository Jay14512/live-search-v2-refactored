// Get DOM Elements: Field for City and dropdown
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

// As soon as there's input from the user:
ort.addEventListener("input", function (ev) {
    clearCoordinates();
    clearPlz();
    // Fetch API Data (City + CAPs)
    fetch(`http://wifi.1av.at/getplz.php?json`)
        .then(response => response.json()) // Convert JSON-Text in JS-Object 

        .then(data => {
            //  Build new Array: every Object has City + matching CAP
            const orteMitPlz = [];
            Object.entries(data).forEach(([plz, orteArray]) => {
                orteArray.forEach(ort => {
                    orteMitPlz.push({ ort: ort, plz: plz });
                });
            });

            //  Count how many times one City exists (e.g. Vienna = 23×)
            const ortAnzahl = {};
            orteMitPlz.forEach(item => {
                ortAnzahl[item.ort] = (ortAnzahl[item.ort] || 0) + 1;
            });

            //  Input from user (e.g. "wi") in lowercase
            const input = ev.target.value.toLowerCase();

            // Filter only cities that match input
            const matching = orteMitPlz.filter(item =>
                item.ort.toLowerCase().startsWith(input)
            );

            //  If no match or dropdown empty: empty list and cancel
            if (matching.length === 0 || input === "") {
                suggestions.innerHTML = "";
                return;
            }

            //  Function: Only shows City + CAP when City exists multiple times
            function formatOrt(item) {
                if (ortAnzahl[item.ort] > 1) {
                    return `${item.ort} (${item.plz})`;
                } else {
                    return item.ort;
                }
            }

            //Build HTML for dropdown, inkl. data attributes
            let html = "";
            matching.forEach(item => {
                html += `<li data-ort="${item.ort}" data-plz="${item.plz}">${formatOrt(item)}</li>`;
            });

            //Insert suggestions into page
            suggestions.innerHTML = `<ul>${html}</ul>`;

            //Get all <li> entries
            const listItems = suggestions.querySelectorAll("li");

            // Add click event for every suggestion
            listItems.forEach(li => {
                li.addEventListener("click", function (ev) {
                    // - insert city in field
                    ort.value = li.dataset.ort;
                    // - insert CAP in field
                    plz.value = li.dataset.plz;
                    // - hide Dropdown 
                    suggestions.innerHTML = "";


                });
            });
        })

        // Error handling for API errors
        .catch(error => console.error("Error: ", error));
});

//Get Web API when button has been clicked
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

//Add Event Listener to hide Dropdown when click outside of Dropdown list 
document.addEventListener("click", function (ev) {
    if (!ort.contains(ev.target) && !suggestions.contains(ev.target)) {
        suggestions.innerHTML = "";
    }
});