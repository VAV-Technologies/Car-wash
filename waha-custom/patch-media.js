/**
 * Patches WAHA Core to enable sendImage, sendFile, sendVoice
 * These methods throw AvailableInPlusVersion() in Core.
 * We replace them with actual implementations using whatsapp-web.js MessageMedia.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join('/app', 'src', 'core', 'engines', 'webjs', 'session.webjs.core.ts');
let code = fs.readFileSync(filePath, 'utf-8');

// Replace sendImage
code = code.replace(
  /sendImage\(request:\s*MessageImageRequest\)\s*\{[\s\S]*?throw\s+new\s+AvailableInPlusVersion\(\);?\s*\}/,
  `async sendImage(request: MessageImageRequest) {
    const file = request.file as any;
    let media: MessageMedia;
    if (file.url) {
      media = await MessageMedia.fromUrl(file.url, { unsafeMime: true });
    } else {
      media = new MessageMedia(file.mimetype, file.data, file.filename);
    }
    const options = this.getMessageOptions(request);
    if (request.caption) (options as any).caption = request.caption;
    return this.whatsapp.sendMessage(this.ensureSuffix(request.chatId), media, options);
  }`
);

// Replace sendFile
code = code.replace(
  /sendFile\(request:\s*MessageFileRequest\)\s*\{[\s\S]*?throw\s+new\s+AvailableInPlusVersion\(\);?\s*\}/,
  `async sendFile(request: MessageFileRequest) {
    const file = request.file as any;
    let media: MessageMedia;
    if (file.url) {
      media = await MessageMedia.fromUrl(file.url, { unsafeMime: true });
    } else {
      media = new MessageMedia(file.mimetype, file.data, file.filename);
    }
    const options = this.getMessageOptions(request);
    if ((request as any).caption) (options as any).caption = (request as any).caption;
    return this.whatsapp.sendMessage(this.ensureSuffix(request.chatId), media, options);
  }`
);

// Replace sendVoice
code = code.replace(
  /sendVoice\(request:\s*MessageVoiceRequest\)\s*\{[\s\S]*?throw\s+new\s+AvailableInPlusVersion\(\);?\s*\}/,
  `async sendVoice(request: MessageVoiceRequest) {
    const file = (request as any).file as any;
    let media: MessageMedia;
    if (file.url) {
      media = await MessageMedia.fromUrl(file.url, { unsafeMime: true });
    } else {
      media = new MessageMedia(file.mimetype, file.data, file.filename);
    }
    const options = this.getMessageOptions(request);
    (options as any).sendAudioAsVoice = true;
    return this.whatsapp.sendMessage(this.ensureSuffix(request.chatId), media, options);
  }`
);

fs.writeFileSync(filePath, code);
console.log('Patched sendImage, sendFile, sendVoice in session.webjs.core.ts');
