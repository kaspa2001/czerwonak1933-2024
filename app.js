console.log("NOWA WERSJA APP.JS — CZERWONAK 1933–2024");

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

map.createPane("leftPane");
map.getPane("leftPane").style.zIndex = 401;

map.createPane("rightPane");
map.getPane("rightPane").style.zIndex = 402;

map.createPane("granicaPane");
map.getPane("granicaPane").style.zIndex = 450;

const leftPane = map.getPane("leftPane");
const rightPane = map.getPane("rightPane");

let swipePosition = 50;

function updateSwipe(position) {
    swipePosition = position;

    const mapSize = map.getSize();
    const dividerX = mapSize.x * (position / 100);

    /*
     * Panele Leafleta są przesuwane transformacją podczas
     * panoramowania i powiększania. Dlatego pozycję suwaka
     * przeliczamy ze współrzędnych kontenera mapy
     * na współrzędne warstw Leafleta.
     */

    const topLeft = map.containerPointToLayerPoint([0, 0]);

    const dividerTop = map.containerPointToLayerPoint([
        dividerX,
        0
    ]);

    const bottomRight = map.containerPointToLayerPoint([
        mapSize.x,
        mapSize.y
    ]);

    /*
     * Rok 1933: widoczny od lewej krawędzi do suwaka.
     */

    leftPane.style.clip =
        `rect(` +
        `${topLeft.y}px, ` +
        `${dividerTop.x}px, ` +
        `${bottomRight.y}px, ` +
        `${topLeft.x}px` +
        `)`;

    /*
     * Rok 2024: widoczny od suwaka do prawej krawędzi.
     */

    rightPane.style.clip =
        `rect(` +
        `${topLeft.y}px, ` +
        `${bottomRight.x}px, ` +
        `${bottomRight.y}px, ` +
        `${dividerTop.x}px` +
        `)`;

    /*
     * Usuwamy poprzednią metodę przycinania,
     * żeby clipPath nie ukrywał warstw.
     */

    leftPane.style.clipPath = "";
    rightPane.style.clipPath = "";

    console.log("SUWAK:", position);
}

map.on("move zoom resize viewreset", function () {
    updateSwipe(swipePosition);
});

const swipeHandle = document.getElementById("swipe-handle");

let isDragging = false;

function moveSwipe(clientX) {
    const mapRect = map.getContainer().getBoundingClientRect();

    let position =
        ((clientX - mapRect.left) / mapRect.width) * 100;

    position = Math.max(0, Math.min(100, position));

    updateSwipe(position);
    swipeHandle.style.left = `${position}%`;
}

function startSwipe(event) {
    event.preventDefault();
    event.stopPropagation();

    isDragging = true;

    map.dragging.disable();

    swipeHandle.setPointerCapture(event.pointerId);

    moveSwipe(event.clientX);
}

function dragSwipe(event) {
    if (!isDragging) {
        return;
    }

    event.preventDefault();

    moveSwipe(event.clientX);
}

function stopSwipe(event) {
    if (!isDragging) {
        return;
    }

    isDragging = false;

    if (swipeHandle.hasPointerCapture(event.pointerId)) {
        swipeHandle.releasePointerCapture(event.pointerId);
    }

    map.dragging.enable();
}

swipeHandle.addEventListener("pointerdown", startSwipe);
swipeHandle.addEventListener("pointermove", dragSwipe);
swipeHandle.addEventListener("pointerup", stopSwipe);
swipeHandle.addEventListener("pointercancel", stopSwipe);

/*
 * Osobne panele rysowania zapewniają prawidłową kolejność warstw.
 * Niższy z-index oznacza warstwę rysowaną niżej.
 */
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
    },

    las: {
        color: "#3f7d45",
        weight: 0.8,
        fillColor: "#69a85f",
        fillOpacity: 0.78,
    },

    zielone: {
        color: "#6fa65d",
        weight: 0.8,
        fillColor: "#a8cf7a",
        fillOpacity: 0.72,
    },

    nieuzytki: {
        color: "#9a8d78",
        weight: 0.8,
        fillColor: "#c8bca8",
        fillOpacity: 0.72,
    },

    jeziora: {
        color: "#397ca8",
        weight: 1,
        fillColor: "#73b7df",
        fillOpacity: 0.82,
    },

    zabudowa: {
        color: "#9f2929",
        weight: 0.8,
        fillColor: "#d64b45",
        fillOpacity: 0.84,
    },

    przemysl: {
        color: "#6d477f",
        weight: 1,
        fillColor: "#9770a8",
        fillOpacity: 0.84,
    },

    cmentarze: {
        color: "#3e6c4f",
        weight: 1,
        fillColor: "#739b77",
        fillOpacity: 0.82,
    },

    drogiLokalne: {
        color: "#f4f1e8",
        weight: 1.4,
        opacity: 1,
    },

    drogiGlowne: {
        color: "#e99637",
        weight: 2.6,
        opacity: 1,
    },

    kolej: {
        color: "#383838",
        weight: 2,
        opacity: 1,
        dashArray: "5 4",
    },

    granica: {
        color: "#1d1d1d",
        weight: 3,
        opacity: 1,
        fillOpacity: 0,
    }
};

async function loadGeoJSON(path, style, paneName) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(
            `Nie udało się wczytać pliku ${path}. Kod: ${response.status}`
        );
    }

    const data = await response.json();

    return L.geoJSON(data, {
        pane: paneName,

        style: function () {
            return {
                ...style,
                pane: paneName
            };
        }
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

            loadGeoJSON("data/granica.geojson", styles.granica, "granicaPane"),

            loadGeoJSON("data/rolne_1933.geojson", styles.rolne, "leftPane"),
            loadGeoJSON("data/las_1933.geojson", styles.las, "leftPane"),
            loadGeoJSON("data/zielone_1933.geojson", styles.zielone, "leftPane"),
            loadGeoJSON("data/nieuzytki_1933.geojson", styles.nieuzytki, "leftPane"),
            loadGeoJSON("data/jeziora_1933.geojson", styles.jeziora, "leftPane"),
            loadGeoJSON("data/zabudowa_1933.geojson", styles.zabudowa, "leftPane"),
            loadGeoJSON("data/przemysl_1933.geojson", styles.przemysl, "leftPane"),
            loadGeoJSON("data/cmentarze_1933.geojson", styles.cmentarze, "leftPane"),
            loadGeoJSON("data/drogi_lokalne_1933.geojson", styles.drogiLokalne, "leftPane"),
            loadGeoJSON("data/drogi_glowne_1933.geojson", styles.drogiGlowne, "leftPane"),
            loadGeoJSON("data/kolej_1933.geojson", styles.kolej, "leftPane"),

            loadGeoJSON("data/rolne_2024.geojson", styles.rolne, "rightPane"),
            loadGeoJSON("data/las_2024.geojson", styles.las, "rightPane"),
            loadGeoJSON("data/zielone_2024.geojson", styles.zielone, "rightPane"),
            loadGeoJSON("data/nieuzytki_2024.geojson", styles.nieuzytki, "rightPane"),
            loadGeoJSON("data/jeziora_2024.geojson", styles.jeziora, "rightPane"),
            loadGeoJSON("data/zabudowa_2024.geojson", styles.zabudowa, "rightPane"),
            loadGeoJSON("data/przemysl_2024.geojson", styles.przemysl, "rightPane"),
            loadGeoJSON("data/cmentarze_2024.geojson", styles.cmentarze, "rightPane"),
            loadGeoJSON("data/drogi_lokalne_2024.geojson", styles.drogiLokalne, "rightPane"),
            loadGeoJSON("data/drogi_glowne_2024.geojson", styles.drogiGlowne, "rightPane"),
            loadGeoJSON("data/kolej_2024.geojson", styles.kolej, "rightPane")
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

        updateSwipe(50);
        swipeHandle.style.left = "50%";

        /*
         * Lewa strona: 1933.
         * Prawa strona: 2024.
         */

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
