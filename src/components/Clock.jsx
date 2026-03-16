import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const beijingTimeOptions = {
    timeZone: 'Asia/Shanghai',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  const beijingDateOptions = {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };

  const timeString = new Intl.DateTimeFormat('zh-CN', beijingTimeOptions).format(time);
  const dateString = new Intl.DateTimeFormat('zh-CN', beijingDateOptions).format(time);

  return (
    <div className="card clock-container">
      <div className="label">北京时间 (精确到秒)</div>
      <div className="time">{timeString}</div>
      <div className="date">{dateString}</div>
    </div>
  );
};

export default Clock;
