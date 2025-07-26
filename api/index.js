const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// 存储设备和应用数据（使用全局变量，注意无服务器环境的限制）
let devices = {};

app.post('/api/app-usage', (req, res) => {
    const data = req.body;
    console.log('Received data:', data);
    
    if (!data.device_id) {
        return res.status(400).json({ error: 'Device ID is required' });
    }
    
    // 更新设备数据
    devices[data.device_id] = {
        ...data,
        last_update: Date.now(),
        status: 'online'
    };
    
    res.status(200).json({ message: 'Data received successfully' });
});

app.get('/api/current-status', (req, res) => {
    // 更新设备状态（超过30秒无更新视为离线）
    Object.keys(devices).forEach(deviceId => {
        if (Date.now() - devices[deviceId].last_update > 30000) {
            devices[deviceId].status = 'offline';
        }
    });
    
    res.json(Object.values(devices));
});

// 导出为 Vercel 无服务器函数
module.exports = app;
