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

/*
 * Osobne panele rysowania zapewniają prawidłową kolejność warstw.
 * Niższy z-index oznacza warstwę rysowaną niżej.
 */

map.createPane("terenyPane");
map.getPane("terenyPane").style.zIndex = 410;

map.createPane("wodyPane");
map.getPane("wodyPane").style.zIndex = 420;

map.createPane("zabudowaPane");
map.getPane("zabudowaPane").style.zIndex = 430;

map.createPane("transportPane");
map.getPane("transportPane").style.zIndex = 440;

map.createPane("granicaPane");
map.getPane("granicaPane").style.zIndex = 460;

/*
 * Symbolizacja klas.
 * Ta sama klasa ma identyczny kolor w 1933 i 2024 roku.
 */

const styles = {
    rolne: {
        color: "#d2a923",
        weight: 0.8,
        fillColor: "#f4dc72",
        fillOpacity: 0.72,
        pane: "terenyPane"
    },

    las: {
        color: "#3f7d45",
        weight: 0.8,
        fillColor: "#69a85f",
        fillOpacity: 0.78,
        pane: "terenyPane"
    },

    zielone: {
        color: "#6fa65d",
        weight: 0.8,
        fillColor: "#a8cf7a",
        fillOpacity: 0.72,
        pane: "terenyPane"
    },

    nieuzytki: {
        color: "#9a8d78",
        weight: 0.8,
        fillColor: "#c8bca8",
        fillOpacity: 0.72,
        pane: "terenyPane"
    },

    jeziora: {
        color: "#397ca8",
        weight: 1,
        fillColor: "#73b7df",
        fillOpacity: 0.82,
        pane: "wodyPane"
    },

    zabudowa: {
        color: "#9f2929",
        weight: 0.8,
        fillColor: "#d64b45",
        fillOpacity: 0.84,
        pane: "zabudowaPane"
    },

    przemysl: {
        color: "#6d477f",
        weight: 1,
        fillColor: "#9770a8",
        fillOpacity: 0.84,
        pane: "zabudowaPane"
    },

    cmentarze: {
        color: "#3e6c4f",
        weight: 1,
        fillColor: "#739b77",
        fillOpacity: 0.82,
        pane: "zabudowaPane"
    },

    drogiLokalne: {
        color: "#f4f1e8",
        weight: 1.4,
        opacity: 1,
        pane: "transportPane"
    },

    drogiGlowne: {
        color: "#e99637",
        weight: 2.6,
        opacity: 1,
        pane: "transportPane"
    },

    kolej: {
        color: "#383838",
        weight: 2,
        opacity: 1,
        dashArray: "5 4",
        pane: "transportPane"
    },

    granica: {
        color: "#1d1d1d",
        weight: 3,
        opacity: 1,
        fillOpacity: 0,
        pane: "granicaPane"
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
        style: style,
        pane: style.pane
    });
}

async function initialiseMap() {
    try {
        const [
            granica,

            rolne1933,
            las1933,
            zielone1933,
            nieuzytki1933,
            jeziora1933,
            zabudowa1933,
            przemysl1933,
            cmentarze1933,
            drogiLokalne1933,
            drogiGlowne1933,
            kolej1933,

            rolne2024,
            las2024,
            zielone2024,
            nieuzytki2024,
            jeziora2024,
            zabudowa2024,
            przemysl2024,
            cmentarze2024,
            drogiLokalne2024,
            drogiGlowne2024,
            kolej2024

        ] = await Promise.all([

            loadGeoJSON("data/granica.geojson", styles.granica),

            loadGeoJSON("data/rolne_1933.geojson", styles.rolne),
            loadGeoJSON("data/las_1933.geojson", styles.las),
            loadGeoJSON("data/zielone_1933.geojson", styles.zielone),
            loadGeoJSON("data/nieuzytki_1933.geojson", styles.nieuzytki),
            loadGeoJSON("data/jeziora_1933.geojson", styles.jeziora),
            loadGeoJSON("data/zabudowa_1933.geojson", styles.zabudowa),
            loadGeoJSON("data/przemysl_1933.geojson", styles.przemysl),
            loadGeoJSON("data/cmentarze_1933.geojson", styles.cmentarze),
            loadGeoJSON(
                "data/drogi_lokalne_1933.geojson",
                styles.drogiLokalne
            ),
            loadGeoJSON(
                "data/drogi_glowne_1933.geojson",
                styles.drogiGlowne
            ),
            loadGeoJSON("data/kolej_1933.geojson", styles.kolej),

            loadGeoJSON("data/rolne_2024.geojson", styles.rolne),
            loadGeoJSON("data/las_2024.geojson", styles.las),
            loadGeoJSON("data/zielone_2024.geojson", styles.zielone),
            loadGeoJSON("data/nieuzytki_2024.geojson", styles.nieuzytki),
            loadGeoJSON("data/jeziora_2024.geojson", styles.jeziora),
            loadGeoJSON("data/zabudowa_2024.geojson", styles.zabudowa),
            loadGeoJSON("data/przemysl_2024.geojson", styles.przemysl),
            loadGeoJSON("data/cmentarze_2024.geojson", styles.cmentarze),
            loadGeoJSON(
                "data/drogi_lokalne_2024.geojson",
                styles.drogiLokalne
            ),
            loadGeoJSON(
                "data/drogi_glowne_2024.geojson",
                styles.drogiGlowne
            ),
            loadGeoJSON("data/kolej_2024.geojson", styles.kolej)
        ]);

        /*
         * Kolejność tablic odpowiada kolejności logicznej klas.
         * Wszystkie warstwy zostaną dodane do mapy, natomiast
         * suwak ograniczy ich widoczność do odpowiedniej strony.
         */

        const warstwy1933 = [
            rolne1933,
            las1933,
            zielone1933,
            nieuzytki1933,
            jeziora1933,
            zabudowa1933,
            przemysl1933,
            cmentarze1933,
            drogiLokalne1933,
            drogiGlowne1933,
            kolej1933
        ];

        const warstwy2024 = [
            rolne2024,
            las2024,
            zielone2024,
            nieuzytki2024,
            jeziora2024,
            zabudowa2024,
            przemysl2024,
            cmentarze2024,
            drogiLokalne2024,
            drogiGlowne2024,
            kolej2024
        ];

        warstwy1933.forEach(layer => layer.addTo(map));
        warstwy2024.forEach(layer => layer.addTo(map));

        /*
         * Granica jest dodana osobno i nie podlega przecinaniu suwakiem.
         */

        granica.addTo(map);

        /*
         * Lewa strona: 1933.
         * Prawa strona: 2024.
         */

        L.control
            .sideBySide(warstwy1933, warstwy2024, {
                padding: 44
            })
            .addTo(map);

        if (granica.getBounds().isValid()) {
            map.fitBounds(granica.getBounds(), {
                padding: [20, 20]
            });
        } else {
            map.setView([52.51, 17.0], 11);
        }

    } catch (error) {
        console.error(error);

        map.setView([52.51, 17.0], 11);

        const message = document.createElement("div");
        message.className = "map-status";
        message.textContent =
            "Nie udało się wczytać jednej z warstw. " +
            "Sprawdź konsolę przeglądarki oraz nazwy plików w folderze data.";

        map.getContainer().appendChild(message);
    }
}

initialiseMap();
