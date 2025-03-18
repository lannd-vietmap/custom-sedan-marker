map.on("load", async function () {
    try {
        const response = await fetch("./location.json");
        const jsonData = await response.json();

        if (!jsonData || !Array.isArray(jsonData)) {
            console.error("Dữ liệu JSON không hợp lệ");
            return;
        }

        const images = {
            "start": await map.loadImage("./image/marker-start.png"),
            "end": await map.loadImage("./image/marker-end.png"),
            "petrol": await map.loadImage("./image/marker-petrol.png")
        };

        for (const key in images) {
            if (images[key]) {
                map.addImage(key, images[key].data);
            }
        }

        const geojsonData = {
            type: "FeatureCollection",
            features: jsonData.map((item) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [item.longitude, item.latitude],
                },
                properties: { type: item.type, name: item.name }
            }))
        };

        map.addSource("markers", {
            type: "geojson",
            data: geojsonData
        });

        ["start", "end", "petrol"].forEach(type => {
            map.addLayer({
                id: `marker-${type}`,
                type: "symbol",
                source: "markers",
                filter: ["==", ["get", "type"], type],
                layout: {
                    "icon-image": type,
                    "icon-size": 0.75,
                    "icon-anchor": "bottom",
                    "icon-offset": [0, -10],
                    
                },
            });
        });


    } catch (error) {
        console.error("Lỗi khi tải JSON:", error);
    }
});
