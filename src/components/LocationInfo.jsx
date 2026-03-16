import React, { useState, useEffect } from 'react';

const LocationInfo = () => {
  const [location, setLocation] = useState({
    latitude: '获取中...',
    longitude: '获取中...',
    address: '正在解析位置...',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    let watchId = null;

    const startTracking = async () => {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        // Request permissions for Android
        const permissionStatus = await Geolocation.requestPermissions();
        if (permissionStatus.location !== 'granted') {
          setError('位置权限未授予，请在手机设置中开启');
          return;
        }

        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (position, err) => {
            if (err) {
              console.error('Capacitor Geolocation error:', err);
              setError('无法获取位置，请确保已授权并开启 GPS');
              return;
            }
            if (position) {
              handlePositionUpdate(position.coords.latitude, position.coords.longitude);
            }
          }
        );
      } catch (e) {
        // Fallback to web API if plugin is not available
        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
            (pos) => handlePositionUpdate(pos.coords.latitude, pos.coords.longitude),
            (err) => {
              console.error('Web Geolocation error:', err);
              setError('无法获取位置，请确保已授权');
            },
            { enableHighAccuracy: true }
          );
        } else {
          setError('浏览器不支持地理位置');
        }
      }
    };

    const handlePositionUpdate = async (latitude, longitude) => {
      setLocation((prev) => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
      }));

      try {
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
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        import('@capacitor/geolocation').then(({ Geolocation }) => {
          Geolocation.clearWatch({ id: watchId });
        }).catch(() => {
          navigator.geolocation.clearWatch(watchId);
        });
      }
    };
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
