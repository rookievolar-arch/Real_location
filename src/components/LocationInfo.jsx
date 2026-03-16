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

        // Try to get a single clear position first to "warm up" the GPS
        try {
          const initialPosition = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
          });
          handlePositionUpdate(initialPosition.coords.latitude, initialPosition.coords.longitude);
        } catch (e) {
          console.warn('Initial position acquisition failed, starting watch instead...');
        }

        watchId = await Geolocation.watchPosition(
          { 
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 3000 
          },
          (position, err) => {
            if (err) {
              console.error('Capacitor Geolocation error:', err);
              // Provide more specific error tips based on common issues
              const msg = err.message || '';
              if (msg.includes('Timeout')) {
                setError('获取位置超时。请确保您在室外或靠近窗户处，并确认已开启 GPS。');
              } else if (msg.includes('Location services')) {
                setError('手机定位服务未开启，请在系统下拉菜单中开启 GPS。');
              } else {
                setError(`获取位置失败: ${msg || '请确保已授权并开启 GPS'}`);
              }
              return;
            }
            if (position) {
              setError(null); // Clear error if we get a position
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
