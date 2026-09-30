import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: false,

  // 🔐 Configuration Keycloak
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'gerai-realm',
    clientId: 'gerai'
  },

  // 🌐 Configuration API Backend Spring Boot
  apiUrl: 'http://localhost:8081/api',

  // 📡 Configuration WebSocket chat-service
  websocketUrl: 'ws://localhost:8086/ws',

  // 📡 Configuration WebSocket notification-service (port 8084, endpoint /ws-notifications)
  notificationWsUrl: 'ws://localhost:8084/ws-notifications',

  // 🔧 Configuration générale
  app: {
    name: 'SYNAPSE',
    description: 'Gestion des Ressources Humaines Intelligente',
    version: packageInfo.version,
    author: 'Votre équipe'
  },

  // 📡 WebSocket — true = simulation, false = real STOMP backend
  mockWs: false,

  // 🔧 MSW — true = intercept HTTP with mock handlers, false = hit real backend
  useMocks: false,

  // ⚙️ Features flags
  features: {
    chat: true,
    notifications: true,
    chatbot: true,
    reports: true,
    analytics: true
  },

  // 📊 Configuration pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },

  // 🕐 Configuration timeouts
  timeout: {
    api: 30000,
    upload: 120000
  }
}