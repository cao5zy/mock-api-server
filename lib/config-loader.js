
// lib/config-loader.js
const fs = require('fs');

class ConfigLoader {
  constructor(configPath) {
    this.configPath = configPath;
    this.mockConfig = {};
    this.defaultResponse = { data: {} };
  }

  load() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      const fullConfig = JSON.parse(configContent);
      
      // 提取默认响应
      if (fullConfig.default) {
        this.defaultResponse = fullConfig.default;
        delete fullConfig.default;
      }
      
      this.mockConfig = fullConfig;
      
      console.log('✅ Mock configuration loaded successfully');
      console.log('Available routes:');
      Object.keys(this.mockConfig).forEach(key => {
        console.log(`  - ${key}`);
      });
      if (Object.keys(this.mockConfig).length === 0) {
        console.log('  - No specific routes configured');
      }
      console.log(`Default response:`, this.defaultResponse);
      
      return { mockConfig: this.mockConfig, defaultResponse: this.defaultResponse };
    } catch (error) {
      console.error('❌ Error loading mock configuration:', error.message);
      console.log('Using empty default response');
      this.mockConfig = {};
      this.defaultResponse = { data: { status: 'ok' } };
      return { mockConfig: this.mockConfig, defaultResponse: this.defaultResponse };
    }
  }
}

module.exports = ConfigLoader;
