
// lib/dynamic-router.js
const { pathToRegexp } = require('path-to-regexp');

function createDynamicRouter(mockConfigRef, defaultResponseRef) {
  // 验证 HTTP 方法
  const validMethods = new Set(['get', 'post', 'put', 'delete', 'patch', 'head', 'options']);
  
  // 标准化路径（确保以 / 开头）
  function normalizePath(apiPath) {
    return apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  }

  return (req, res, next) => {
    const reqMethod = req.method.toLowerCase();
    const reqPath = req.path; // 不包含查询参数
    
    // 遍历所有配置的路由
    for (const routeKey in mockConfigRef.current) {
      try {
        const [method, ...pathParts] = routeKey.split(':');
        const apiPath = pathParts.join(':');
        
        if (!method || !apiPath) {
          continue; // 跳过无效格式
        }
        
        const normalizedMethod = method.toLowerCase();
        const normalizedPath = normalizePath(apiPath);
        
        // 验证方法
        if (!validMethods.has(normalizedMethod)) {
          continue;
        }
        
        // 方法匹配
        if (normalizedMethod !== reqMethod) {
          continue;
        }
        
        // 路径匹配
        const regexp = pathToRegexp(normalizedPath);
        if (regexp.test(reqPath)) {
          console.log(`[CLIENT REQUEST] ${req.method.toUpperCase()}: ${req.originalUrl}`);
          console.log('Request body:', req.body);
          console.log('Request query:', req.query);
          
          // 返回配置的响应
          return res.json(mockConfigRef.current[routeKey]);
        }
      } catch (error) {
        console.error(`❌ Error matching route ${routeKey}:`, error.message);
        continue;
      }
    }
    
    // 未匹配任何路由，记录请求并返回默认响应
    console.log(`[CLIENT REQUEST] ${req.method.toUpperCase()}: ${req.originalUrl} (no match)`);
    res.json(defaultResponseRef.current);
  };
}

module.exports = { createDynamicRouter };
