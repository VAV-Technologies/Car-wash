/**
 * Shera WhatsApp Agent — Deployment Configuration
 *
 * This agent runs WAHA (WhatsApp HTTP API) on Azure Container Instances
 * and connects to the Castudio webhook for AI-powered customer service.
 */

export const DEPLOYMENT_CONFIG = {
  // Azure Container Instance settings
  azure: {
    resourceGroup: 'castudio-agents',
    containerName: 'waha-shera',
    image: 'devlikeapro/waha',
    cpu: 1,
    memoryGb: 1,
    osType: 'Linux',
    ports: [{ port: 3000, protocol: 'TCP' }],
    restartPolicy: 'Always', // 24/7 operation
  },

  // WAHA environment variables
  wahaEnv: {
    WAHA_API_KEY: '${WAHA_API_KEY}', // Set securely via Azure
    WAHA_WEBHOOK_URL: 'https://castudio.id/api/webhook/whatsapp',
    WAHA_WEBHOOK_EVENTS: 'message',
    WAHA_DASHBOARD_USERNAME: 'admin',
    WAHA_DASHBOARD_PASSWORD: '${WAHA_DASHBOARD_PASSWORD}',
    WAHA_ENGINES: 'NOWEB',
    WAHA_SESSION_STORAGE: 'file',
    WAHA_DEVICE_NAME: 'Castudio Shera',
    WAHA_PORT: '3000',
  },

  // Vercel environment variables needed
  vercelEnv: {
    WAHA_API_URL: 'https://{container-ip-or-domain}:3000',
    WAHA_API_KEY: '${WAHA_API_KEY}', // Same key as WAHA
    WAHA_WEBHOOK_SECRET: '${optional-hmac-secret}',
  },

  // Setup steps
  steps: [
    '1. Create Azure Resource Group: az group create --name castudio-agents --location southeastasia',
    '2. Deploy container: az container create --resource-group castudio-agents --name waha-shera --image devlikeapro/waha --cpu 1 --memory 1 --ports 3000 --ip-address Public --restart-policy Always --environment-variables WAHA_API_KEY=<key> WAHA_WEBHOOK_URL=https://castudio.id/api/webhook/whatsapp WAHA_WEBHOOK_EVENTS=message WAHA_DASHBOARD_USERNAME=admin WAHA_DASHBOARD_PASSWORD=<password> WAHA_ENGINES=NOWEB WAHA_SESSION_STORAGE=file WAHA_DEVICE_NAME="Castudio Shera" WAHA_PORT=3000',
    '3. Get container IP: az container show --resource-group castudio-agents --name waha-shera --query ipAddress.ip',
    '4. Set Vercel env vars: vercel env add WAHA_API_URL (value: http://<ip>:3000) and vercel env add WAHA_API_KEY',
    '5. Access WAHA dashboard at http://<ip>:3000/dashboard',
    '6. Start session: POST http://<ip>:3000/api/sessions with { "name": "default", "config": { "webhooks": [{ "url": "https://castudio.id/api/webhook/whatsapp", "events": ["message"] }] } }',
    '7. Get QR code: GET http://<ip>:3000/api/sessions/default/auth/qr',
    '8. Scan QR with Castudio WhatsApp business number',
    '9. Verify: send a test message to the WhatsApp number',
  ],
}

export const DOCKER_COMPOSE = `
version: '3.8'
services:
  waha:
    image: devlikeapro/waha
    container_name: waha-shera
    restart: always
    ports:
      - "3000:3000"
    environment:
      - WAHA_API_KEY=\${WAHA_API_KEY}
      - WAHA_WEBHOOK_URL=https://castudio.id/api/webhook/whatsapp
      - WAHA_WEBHOOK_EVENTS=message
      - WAHA_DASHBOARD_USERNAME=admin
      - WAHA_DASHBOARD_PASSWORD=\${WAHA_DASHBOARD_PASSWORD}
      - WAHA_ENGINES=NOWEB
      - WAHA_SESSION_STORAGE=file
      - WAHA_DEVICE_NAME=Castudio Shera
      - WAHA_PORT=3000
    volumes:
      - waha-data:/app/.sessions

volumes:
  waha-data:
`
