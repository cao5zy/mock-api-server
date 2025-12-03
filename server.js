const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { pathToRegexp } = require('path-to-regexp');

class MockApiServer {
  constructor(configPath = './config/mock-config.json', port = 3001) {
    this.configPath = configPath;
    this.port = port;
    this.app = express();
    this.mockConfig = {};
    this.defaultResponse = { data: {} };
    
    this.init();
  }

  // 初始化服务器
  init() {
    // 解析 JSON 请求体
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // 启用 CORS
    this.app.use(cors());
    
    // 加载配置
    this.loadConfig();
    
    // 设置路由处理器
    this.setupRoutes();
    
    // 处理所有未匹配的请求
    this.app.use('*', (req, res) => {
      console.log(`[DEFAULT] ${req.method.toUpperCase()}: ${req.path}`);
      res.json(this.defaultResponse);
    });
  }

  // 加载配置文件
  loadConfig() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      this.mockConfig = JSON.parse(configContent);
      
      // 提取默认响应
      if (this.mockConfig.default) {
        this.defaultResponse = this.mockConfig.default;
        delete this.mockConfig.default;
      }
      
      console.log('✅ Mock configuration loaded successfully');
      console.log('Available routes:');
      Object.keys(this.mockConfig).forEach(key => {
        console.log(`  - ${key}`);
      });
      if (Object.keys(this.mockConfig).length === 0) {
        console.log('  - No specific routes configured');
      }
      console.log(`Default response:`, this.defaultResponse);
      
    } catch (error) {
      console.error('❌ Error loading mock configuration:', error.message);
      console.log('Using empty default response');
      this.mockConfig = {};
      this.defaultResponse = { data: { status: 'ok' } };
    }
  }

  // 设置路由处理器
  setupRoutes() {
    const routeKeys = Object.keys(this.mockConfig);
    
    routeKeys.forEach(routeKey => {
      try {
        const [method, ...pathParts] = routeKey.split(':');
        const apiPath = pathParts.join(':'); // 处理路径中可能包含冒号的情况
        
        if (!method || !apiPath) {
          console.warn(`⚠️ Invalid route key format: ${routeKey}. Expected format: "METHOD:path"`);
          return;
        }
        
        const normalizedMethod = method.toLowerCase();
        const normalizedPath = this.normalizePath(apiPath);
        const responseConfig = this.mockConfig[routeKey];
        
        // 验证 HTTP 方法
        const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
        if (!validMethods.includes(normalizedMethod)) {
          console.warn(`⚠️ Invalid HTTP method in route key: ${routeKey}`);
          return;
        }
        
        // 创建路由处理器
        this.app[normalizedMethod](normalizedPath, (req, res) => {
          console.log(`[MOCK] ${normalizedMethod.toUpperCase()}: ${req.path}`);
          console.log('Request body:', req.body);
          console.log('Request query:', req.query);
          
          // 返回配置的响应数据
          res.json(responseConfig);
        });
        
        console.log(`✅ Registered route: ${normalizedMethod.toUpperCase()} ${normalizedPath}`);
        
      } catch (error) {
        console.error(`❌ Error setting up route ${routeKey}:`, error.message);
      }
    });
  }

  // 标准化路径（确保以 / 开头）
  normalizePath(apiPath) {
    return apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  }

  // 重新加载配置（用于热重载）
  reloadConfig() {
    console.log('🔄 Reloading mock configuration...');
    this.loadConfig();
  }

  // 启动服务器
  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 Mock API Server is running on http://localhost:${this.port}`);
      console.log(`📁 Configuration file: ${this.configPath}`);
    });
    
    // 监听配置文件变化（可选）
    fs.watch(this.configPath, (eventType) => {
      if (eventType === 'change') {
        setTimeout(() => this.reloadConfig(), 100);
      }
    });
    
    return this.server;
  }

  // 停止服务器
  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Mock API Server stopped');
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const configPath = process.env.MOCK_CONFIG || './config/mock-config.json';
  const port = parseInt(process.env.PORT) || 3001;
  
  const server = new MockApiServer(configPath, port);
  
  // 处理优雅关闭
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Shutting down gracefully...');
    server.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Shutting down gracefully...');
    server.stop();
    process.exit(0);
  });
  
  server.start();
}

module.exports = MockApiServer;
