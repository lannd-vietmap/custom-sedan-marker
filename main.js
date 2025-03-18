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
});


const popup = new vietmapgl.Popup({ offset: 50, closeOnClick: false, closeButton: false })
    .setLngLat([106.69531282536502, 10.776983649766555])
    .setHTML('<strong>Dinh Độc Lập </strong><p>Di tích lịch sử về chiến tranh Việt Nam cho phép tham quan văn phòng chính phủ, phòng chỉ huy và hiện vật.Di tích lịch sử về chiến tranh Việt Nam cho phép tham quan văn phòng chính phủ, phòng chỉ huy và hiện vật.</p>')
    .addTo(map);


