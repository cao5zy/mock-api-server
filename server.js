
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const ConfigLoader = require('./lib/config-loader');
const { createDynamicRouter } = require('./lib/dynamic-router');

class MockApiServer {
  constructor(configPath = './config/mock-config.json', port = 3001) {
    this.configPath = configPath;
    this.port = port;
    this.app = express();
    
    // 使用可变引用对象，以便动态路由中间件能访问最新配置
    this.mockConfigRef = { current: {} };
    this.defaultResponseRef = { current: { data: {} } };
    
    this.init();
  }

  init() {
    // 解析 JSON 请求体
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // 启用 CORS
    this.app.use(cors());
    
    // 加载配置
    this.loadConfig();
    
    // 设置动态路由中间件（必须在其他中间件之后，但在兜底处理之前）
    this.app.use(createDynamicRouter(this.mockConfigRef, this.defaultResponseRef));
  }

  loadConfig() {
    const configLoader = new ConfigLoader(this.configPath);
    const { mockConfig, defaultResponse } = configLoader.load();
    
    // 更新引用
    this.mockConfigRef.current = mockConfig;
    this.defaultResponseRef.current = defaultResponse;
  }

  reloadConfig() {
    console.log('🔄 Reloading mock configuration...');
    this.loadConfig();
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 Mock API Server is running on http://localhost:${this.port}`);
      console.log(`📁 Configuration file: ${this.configPath}`);
    });
    
    // 监听配置文件变化
    fs.watch(this.configPath, (eventType) => {
      if (eventType === 'change') {
        // 防抖：避免频繁重载
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(() => this.reloadConfig(), 100);
      }
    });
    
    return this.server;
  }

  stop() {
    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
    }
    if (this.server) {
      this.server.close();
      console.log('🛑 Mock API Server stopped');
    }
  }
}

module.exports = MockApiServer;
