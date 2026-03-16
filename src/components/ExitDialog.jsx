import React from 'react';
import { motion } from 'framer-motion';

const ExitDialog = ({ onCancel, onConfirm }) => {
  return (
    <div className="dialog-overlay">
      <motion.div 
        className="dialog-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="dialog-title">确认退出</div>
        <p style={{ color: '#595959', marginBottom: '20px' }}>您确定要关闭应用程序吗？</p>
        <div className="dialog-actions">
          <button className="btn btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button className="btn btn-exit" onClick={onConfirm}>
            退出
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExitDialog;
