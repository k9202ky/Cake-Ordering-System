function initMap() {
    const shopLocation = { lat: 24.934345245361328, lng: 121.12305450439453 };
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: shopLocation
    });
    const marker = new google.maps.Marker({
        position: shopLocation,
        map: map,
        title: '祥盛中西禮餅'
    });
}

// 確保在 DOMContentLoaded 事件觸發後調用 initMap
document.addEventListener('DOMContentLoaded', function() {
    if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
        initMap();
    } else {
        window.initMap = initMap; // 設置回調函數，確保地圖 API 加載完成後調用
    }
});
