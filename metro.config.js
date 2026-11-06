// Metro (uygulama paketleyicisi) ayarları.
// admin/ klasörü ayrı bir web uygulamasıdır; kendi node_modules'u uygulamaya karışmasın.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
// Windows (C:\\...) ve Linux/macOS yollarında çalışsın: özel karakterleri kaçır, ayraçları esnek yap
const adminDir = path
  .resolve(__dirname, 'admin')
  .split(/[/\\]/)
  .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('[/\\\\]');
const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  new RegExp(`^${adminDir}[/\\\\].*`),
];

module.exports = config;
