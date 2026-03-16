import React, { useState, useEffect } from 'react';

const LocationInfo = () => {
  const [gpsLocation, setGpsLocation] = useState({
    latitude: '',
    longitude: '',
    address: '正在搜索卫星信号...',
    status: 'searching' // searching, success, error
  });

  const [networkLocation, setNetworkLocation] = useState({
    address: '正在通过网络定位...',
    city: '',
    district: '',
    status: 'loading'
  });

  const [gpsError, setGpsError] = useState(null);

  useEffect(() => {
    let watchId = null;

    // 1. Initial Network Position (IP-based - Very fast, works indoors)
    const getNetworkPosition = async () => {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh`
        );
        const data = await response.json();
        const city = data.city || data.principalSubdivision || '';
        const district = data.locality || '';
        setNetworkLocation({
          address: city && district ? `${city} ${district}` : city || '解析成功',
          city,
          district,
          status: 'success'
        });
      } catch (err) {
        console.error('Network positioning failed:', err);
        setNetworkLocation(prev => ({ ...prev, address: '网络定位暂不可用', status: 'error' }));
      }
    };

    // 2. High Accuracy GPS Position
    const startGpsTracking = async () => {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        const permissionStatus = await Geolocation.requestPermissions();
        if (permissionStatus.location !== 'granted') {
          setGpsError('未授予定位权限');
          return;
        }

        watchId = await Geolocation.watchPosition(
          { 
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0 
          },
          (position, err) => {
            if (err) {
              console.error('GPS error:', err);
              if (!gpsLocation.latitude) {
                setGpsError(err.message?.includes('Timeout') ? 'GPS 搜星超时(建议移至窗边)' : `GPS 错误: ${err.message}`);
              }
              return;
            }
            if (position) {
              setGpsError(null);
              handleGpsUpdate(position.coords.latitude, position.coords.longitude);
            }
          }
        );
      } catch (e) {
        // Simple web fallback for GPS
        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
            (pos) => {
              setGpsError(null);
              handleGpsUpdate(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => setGpsError('GPS 启动失败'),
            { enableHighAccuracy: true }
          );
        }
      }
    };

    const handleGpsUpdate = async (lat, lng) => {
      setGpsLocation(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        status: 'success'
      }));

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`
        );
        const data = await response.json();
        const city = data.city || data.principalSubdivision || '';
        const district = data.locality || '';
        setGpsLocation(prev => ({
          ...prev,
          address: city && district ? `${city} ${district}` : city || '经纬度解析成功'
        }));
      } catch (err) {
        setGpsLocation(prev => ({ ...prev, address: '位置解析失败(请检查网络)' }));
      }
    };

    getNetworkPosition();
    startGpsTracking();

    return () => {
      if (watchId !== null) {
        import('@capacitor/geolocation').then(({ Geolocation }) => {
          Geolocation.clearWatch({ id: watchId });
        }).catch(() => {
          if (navigator.geolocation) navigator.geolocation.clearWatch(watchId);
        });
      }
    };
  }, []);

  return (
    <div className="location-group">
      {/* 模块1: 精确位置 (GPS) */}
      <div className={`card location-container ${gpsError ? 'error-card' : ''}`}>
        <div className="label-row">
          <span className="label">精确位置 (GPS/北斗)</span>
          <span className={`status-tag ${gpsLocation.status}`}>{gpsLocation.status === 'success' ? '已通过硬件定位' : '硬件搜星中...'}</span>
        </div>
        
        {gpsError ? (
          <div className="error-msg">{gpsError}</div>
        ) : (
          <>
            <div className="value primary-text">{gpsLocation.address}</div>
            <div className="coord-grid">
              <div className="coord-item">
                <div className="label-small">经度</div>
                <div className="value-small">{gpsLocation.longitude || '等待信号'}</div>
              </div>
              <div className="coord-item">
                <div className="label-small">纬度</div>
                <div className="value-small">{gpsLocation.latitude || '等待信号'}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 模块2: 网络位置 (辅助定位) */}
      <div className="card location-container network-card">
        <div className="label-row">
          <span className="label">网络位置 (IP/基站辅助)</span>
          <span className="status-tag success">稳定可用</span>
        </div>
        <div className="value primary-text">{networkLocation.address}</div>
        <div className="tip-text">注意：网络定位在室内也能使用，但精度通常在百米范围内。</div>
      </div>
    </div>
  );
};

export default LocationInfo;
