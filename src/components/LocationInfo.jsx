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
        
        // Request permissions
        const permissionStatus = await Geolocation.requestPermissions();
        if (permissionStatus.location !== 'granted') {
          setError('位置权限未授予，请在手机设置中开启');
          return;
        }

        // Try to get a single position first with a very long timeout and fallback
        const getInitialPosition = async () => {
          try {
            // First try high accuracy
            const pos = await Geolocation.getCurrentPosition({
              enableHighAccuracy: true,
              timeout: 30000, // 30 seconds
              maximumAge: 10000
            });
            handlePositionUpdate(pos.coords.latitude, pos.coords.longitude);
          } catch (e) {
            console.warn('High accuracy failed, trying low accuracy fallback...', e);
            try {
              // Fallback to low accuracy (network/wifi) which is much faster
              const pos = await Geolocation.getCurrentPosition({
                enableHighAccuracy: false,
                timeout: 30000
              });
              handlePositionUpdate(pos.coords.latitude, pos.coords.longitude);
            } catch (e2) {
              console.error('Initial position acquisition failed completely:', e2);
            }
          }
        };

        await getInitialPosition();

        watchId = await Geolocation.watchPosition(
          { 
            enableHighAccuracy: true, // Keep trying high accuracy in background
            timeout: 60000, // 60 seconds for watch
            maximumAge: 0 
          },
          (position, err) => {
            if (err) {
              console.error('Capacitor Geolocation error:', err);
              // Only set error if we don't even have a cached/fallback location
              if (!location.latitude || location.latitude === '获取中...') {
                const msg = err.message || '';
                if (msg.includes('Timeout')) {
                  setError('定位超时(搜星较慢)。请确保已开启 GPS 并尝试移至室外。我们将继续在后台尝试。');
                } else {
                  setError(`定位失败: ${msg || '请检查 GPS 设置'}`);
                }
              }
              return;
            }
            if (position) {
              setError(null);
              handlePositionUpdate(position.coords.latitude, position.coords.longitude);
            }
          }
        );
      } catch (e) {
        // Fallback to web API
        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              setError(null);
              handlePositionUpdate(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
              console.error('Web Geolocation error:', err);
              setError('无法获取位置，请确保已授权并开启 GPS');
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          setError('当前环境不支持地理位置获取');
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
        // More robust fetch for reverse geocoding
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        
        const data = await response.json();
        const city = data.city || data.principalSubdivision || data.locality || '';
        const district = data.locality || data.localityInfo?.informative?.find(i => i.order === 4)?.name || '';
        
        setLocation((prev) => ({
          ...prev,
          address: city ? (district && city !== district ? `${city} ${district}` : city) : '位置解析完成',
        }));
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
        setLocation((prev) => ({ ...prev, address: '经纬度已获取，但地址解析失败(请检查网络)' }));
      }
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        import('@capacitor/geolocation').then(({ Geolocation }) => {
          Geolocation.clearWatch({ id: watchId });
        }).catch(() => {
          if (navigator.geolocation && watchId) {
            navigator.geolocation.clearWatch(watchId);
          }
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
