/// <reference types="vite/client" />

// QR code du mode télé (paquet sans types)
declare module 'qrcode' {
  const QRCode: { toDataURL(texte: string, opts?: Record<string, unknown>): Promise<string> }
  export default QRCode
}
