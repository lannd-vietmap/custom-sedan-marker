VIETMAP_APIKEY = '';

const map = new vietmapgl.Map({
    container: 'map',
    style: 'https://maps.vietmap.vn/mt/tm/style.json?apikey=' + VIETMAP_APIKEY,
    center: [106.681944, 10.769444],
    zoom: 14
});

map.addControl(new vietmapgl.NavigationControl());

map.on("load", async function () {
    try {
        const image = await map.loadImage("./image/sedan.png");
        if (!image) throw new Error("Failed to load image");

        map.addImage("sedan", image.data);

        map.addSource("point", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [{
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [106.6953128, 10.7769836]
                    }
                }]
            }
        });

        map.addLayer({
            id: "points",
            type: "symbol",
            source: "point",
            layout: {
                "icon-image": "sedan",
                "icon-size": 0.75,
                "icon-anchor": "bottom",
                "icon-offset": [0, -10]
            }
        });

        const popup = new vietmapgl.Popup({ offset: 50, closeOnClick: false, closeButton: false })
            .setLngLat([106.6953128, 10.7769836])
            .setHTML('<strong>Dinh Độc Lập</strong><p>Di tích lịch sử về chiến tranh Việt Nam...</p>')
            .addTo(map);

        const locations = [
            [106.6953128, 10.7769836], [106.704, 10.778], [106.7125, 10.7805],
            [106.721, 10.782], [106.7295, 10.7845], [106.738, 10.787],
            [106.7465, 10.7895], [106.755, 10.792], [106.7635, 10.7945],
            [106.772, 10.797]
        ];

        let index = 0;
        function moveMarker() {
            if (!map.getSource("point")) return;

            const newCoordinates = locations[index];
            map.getSource("point").setData({
                type: "FeatureCollection",
                features: [{ type: "Feature", geometry: { type: "Point", coordinates: newCoordinates } }]
            });

            popup.setLngLat(newCoordinates);
            index = (index + 1) % locations.length;
        }
        setTimeout(() => setInterval(moveMarker, 1000), 500);


        const response = await fetch('./location.json');
        if (!response.ok) throw new Error("Không thể tải dữ liệu!");

        const locationData = await response.json();

        const start = locationData.find(loc => loc.id === 1);
        const end = locationData.find(loc => loc.id === 5);

        if (!start || !end) throw new Error("Không tìm thấy điểm bắt đầu hoặc kết thúc!");

        const routeData = await getRoute(start, end);
        if (!routeData) return;

        const decodedPoints = decodeGooglePolyline(routeData).map(coord => [coord[1], coord[0]]);

        map.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: decodedPoints } }
        });

        map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#ff0000', 'line-width': 5 }
        });

    } catch (error) {
        console.error("Lỗi:", error);
    }
});

async function getRoute(start, end) {
    try {
        const url = `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_APIKEY}&point=${start.latitude},${start.longitude}&point=${end.latitude},${end.longitude}&vehicle=car`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Lỗi khi gọi API!");

        const data = await response.json();
    
        if (!data.paths || data.paths.length === 0) {
            throw new Error("Không có tuyến đường nào!");
        }

        const encodedPolyline = data.paths?.[0]?.points;

        return encodedPolyline; 
    } catch (error) {
        console.error("Lỗi gọi API:", error);
        return null;
    }
}

function decodeGooglePolyline(encoded) {
    let index = 0;
    const coordinates = [];
    let lat = 0, lng = 0;

    while (index < encoded.length) {
        let shift = 0, result = 0, byte = null;
        
        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1F) << shift;
            shift += 5;
        } while (byte >= 0x20);
        
        const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += deltaLat;

        shift = 0;
        result = 0;

        do {
            byte = encoded.charCodeAt(index++) - 63;
            result |= (byte & 0x1F) << shift;
            shift += 5;
        } while (byte >= 0x20);
        
        const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += deltaLng;

        coordinates.push([lat / 1e5, lng / 1e5]);
    }

    return coordinates;
}
