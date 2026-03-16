import React, { useState, useEffect } from 'react';

const LocationInfo = () => {
  const [location, setLocation] = useState({
    latitude: '获取中...',
    longitude: '获取中...',
    address: '正在解析位置...',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('浏览器不支持地理位置');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));

        try {
          // Using a public reverse geocoding API (BigDataCloud is generally fast and free for client-side)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`
          );
          const data = await response.json();
          const city = data.city || data.principalSubdivision || '';
          const district = data.locality || '';
          
          setLocation((prev) => ({
            ...prev,
            address: city && district ? `${city} ${district}` : data.lookupSource === 'Coordinates' ? '无法解析具体街道' : '位置解析完成',
          }));
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
          setLocation((prev) => ({ ...prev, address: '解析失败，请检查网络' }));
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('无法获取位置，请确保已授权');
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (error) {
    return (
      <div className="card location-container" style={{ borderColor: '#ff4d4f' }}>
        <div className="label" style={{ color: '#ff4d4f' }}>位置信息错误</div>
        <div className="value">{error}</div>
      </div>
    );
  }

  return (
    <div className="card location-container">
      <div className="location-item">
        <div className="label">所在城市与地区</div>
        <div className="value">{location.address}</div>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="location-item" style={{ flex: 1 }}>
          <div className="label">经度</div>
          <div className="value">{location.longitude}</div>
        </div>
        <div className="location-item" style={{ flex: 1 }}>
          <div className="label">纬度</div>
          <div className="value">{location.latitude}</div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;
