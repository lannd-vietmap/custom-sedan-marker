VIETMAP_APIKEY = '';

const map = new vietmapgl.Map({
    container: 'map',
    style: 'https://maps.vietmap.vn/mt/tm/style.json?apikey=' + VIETMAP_APIKEY,
    center: [106.681944, 10.769444],
    zoom: 14
});

map.addControl(new vietmapgl.NavigationControl());

map.on("load", async function () {
    const image = await map.loadImage("./image/sedan.png");

    if (!image) {
        console.error("Failed to load image");
        return;
    }

    map.addImage("sedan", image.data);
    map.addSource("point", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [106.69531282536502, 10.776983649766555],
                    },
                },
            ],
        },
    });
    map.addLayer({
        id: "points",
        type: "symbol",
        source: "point",
        layout: {
            "icon-image": "sedan",
            "icon-size": 0.75,
            "icon-anchor": "bottom",
            "icon-offset": [0, -10],
        },
    });

    const locations = [
        [106.6953128, 10.7769836],
        [106.7040000, 10.7780000],
        [106.7125000, 10.7805000],
        [106.7210000, 10.7820000],
        [106.7295000, 10.7845000],
        [106.7380000, 10.7870000],
        [106.7465000, 10.7895000],
        [106.7550000, 10.7920000],
        [106.7635000, 10.7945000],
        [106.7720000, 10.7970000]
    ];

    let index = 0;

    const popup = new vietmapgl.Popup({ offset: 50, closeOnClick: false, closeButton: false })
        .setLngLat(locations[0])
        .setHTML('<strong>Dinh Độc Lập</strong><p>Di tích lịch sử về chiến tranh Việt Nam...</p>')
        .addTo(map);

    function moveMarker() {
        if (!map.getSource("point")) return;

        const newCoordinates = locations[index];

        map.getSource("point").setData({
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: newCoordinates
                }
            }]
        });

        popup.setLngLat(newCoordinates);

        index = (index + 1) % locations.length;
    }

    setTimeout(() => {
        setInterval(moveMarker, 1000);
    }, 500); 
});
