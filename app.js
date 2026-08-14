const map = L.map("map", {
    zoomControl: true
});

const osm = L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">' +
            "OpenStreetMap</a>"
    }
).addTo(map);

const styles = {
    granica: {
        color: "#222222",
        weight: 3,
        opacity: 1,
        fillOpacity: 0
    },

    rolne1933: {
        color: "#b49a5a",
        weight: 1,
        fillColor: "#eadcae",
        fillOpacity: 0.65
    },

    rolne2024: {
        color: "#d5a800",
        weight: 1,
        fillColor: "#ffe875",
        fillOpacity: 0.65
    },

    zabudowa1933: {
        color: "#76483a",
        weight: 1,
        fillColor: "#a46c58",
        fillOpacity: 0.8
    },

    zabudowa2024: {
        color: "#a62828",
        weight: 1,
        fillColor: "#d84a4a",
        fillOpacity: 0.8
    }
};

async function loadGeoJSON(path, style) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(
            `Nie udało się wczytać pliku ${path}. Kod: ${response.status}`
        );
    }

    const data = await response.json();

    return L.geoJSON(data, {
        style: style
    });
}

async function initialiseMap() {
    try {
        const [
            granica,
            rolne1933,
            rolne2024,
            zabudowa1933,
            zabudowa2024
        ] = await Promise.all([
            loadGeoJSON("data/granica.geojson", styles.granica),
            loadGeoJSON("data/rolne_1933.geojson", styles.rolne1933),
            loadGeoJSON("data/rolne_2024.geojson", styles.rolne2024),
            loadGeoJSON("data/zabudowa_1933.geojson", styles.zabudowa1933),
            loadGeoJSON("data/zabudowa_2024.geojson", styles.zabudowa2024)
        ]);

        rolne1933.addTo(map);
        zabudowa1933.addTo(map);
        granica.addTo(map);

        const warstwy = {
            "Tereny rolne 1933": rolne1933,
            "Zabudowa 1933": zabudowa1933,
            "Tereny rolne 2024": rolne2024,
            "Zabudowa 2024": zabudowa2024,
            "Granica gminy": granica
        };

        L.control.layers(null, warstwy, {
            collapsed: false
        }).addTo(map);

        if (granica.getBounds().isValid()) {
            map.fitBounds(granica.getBounds(), {
                padding: [20, 20]
            });
        } else {
            map.setView([52.51, 17.00], 11);
        }

    } catch (error) {
        console.error(error);

        map.setView([52.51, 17.00], 11);

        const message = document.createElement("div");
        message.className = "map-status";
        message.textContent =
            "Nie udało się wczytać jednej z warstw. " +
            "Sprawdź nazwy plików w folderze data.";

        map.getContainer().appendChild(message);
    }
}

initialiseMap();
