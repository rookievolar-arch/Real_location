import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Clock from './components/Clock';
import LocationInfo from './components/LocationInfo';
import ExitDialog from './components/ExitDialog';

function App() {
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Handle hardware back button in Android (via Capacitor later)
  useEffect(() => {
    // For now, this is a web placeholder
  }, []);

  return (
    <div className="app-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Clock />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <LocationInfo />
      </motion.div>

      <div className="exit-trigger" onClick={() => setShowExitDialog(true)}>
        退出软件
      </div>

      <AnimatePresence>
        {showExitDialog && (
          <ExitDialog 
            onCancel={() => setShowExitDialog(false)} 
            onConfirm={() => {
              // In Android, this will call the native exit method
              import('@capacitor/app').then(({ App }) => {
                App.exitApp();
              }).catch(() => {
                alert("正在退出软件... (在浏览器演示模式下，请手动关闭标签页)");
              });
              setShowExitDialog(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
