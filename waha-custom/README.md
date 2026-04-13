# Custom WAHA with Media Sending Enabled

This builds a custom WAHA Docker image with `sendImage`, `sendFile`, and `sendVoice` unlocked (these are paywalled in WAHA Core).

## How it works

The `patch-media.js` script replaces the `throw new AvailableInPlusVersion()` in WAHA's source code with actual implementations using whatsapp-web.js's `MessageMedia` class (which is already imported and used by other Core features).

## Build

```bash
cd waha-custom
docker build -t waha-custom:latest .
```

## Deploy to Azure Container Instance

Replace the existing WAHA container:

```bash
az container create \
  --resource-group castudio-rg \
  --name castudio-waha \
  --image waha-custom:latest \
  --ports 3000 \
  --environment-variables WHATSAPP_DEFAULT_ENGINE=WEBJS \
  --dns-name-label castudio-waha \
  --location southeastasia \
  --cpu 1 --memory 2
```

Or push to Azure Container Registry first:

```bash
# Tag and push
az acr login --name <your-acr>
docker tag waha-custom:latest <your-acr>.azurecr.io/waha-custom:latest
docker push <your-acr>.azurecr.io/waha-custom:latest

# Update container
az container create \
  --resource-group castudio-rg \
  --name castudio-waha \
  --image <your-acr>.azurecr.io/waha-custom:latest \
  --ports 3000 \
  --dns-name-label castudio-waha \
  --location southeastasia
```

## Test

```bash
curl -X POST http://your-waha-url:3000/api/sendImage \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: your-api-key" \
  -d '{
    "session": "default",
    "chatId": "62816104334@c.us",
    "file": {
      "url": "https://example.com/image.jpg",
      "mimetype": "image/jpeg"
    },
    "caption": "Test image"
  }'
```
