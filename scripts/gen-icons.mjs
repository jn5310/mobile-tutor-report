// 실제로 유효한 PNG 아이콘 파일을 프로그램으로 생성합니다.
// 외부 라이브러리 없이 zlib 만으로 RGBA 픽셀 버퍼를 PNG 로 인코딩합니다.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const BRAND = [31, 77, 63] // #1f4d3f 칠판색
const WHITE = [244, 241, 234] // #f4f1ea 종이색

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
    }
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

// size x size RGBA 픽셀을 그리는 콜백 받아 PNG 버퍼 생성
function makePng(size, draw) {
  const bytesPerPixel = 4
  const stride = size * bytesPerPixel
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter type: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y, size)
      const off = y * (stride + 1) + 1 + x * bytesPerPixel
      raw[off] = r
      raw[off + 1] = g
      raw[off + 2] = b
      raw[off + 3] = a
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const idat = deflateSync(raw)
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// 책 모양 글리프를 가진 아이콘을 그립니다.
// maskable 은 여백을 더 두고, fullBleed 는 모서리를 투명하게 비우지 않습니다
// (iOS 와 안드로이드 런처가 직접 모서리를 둥글게 자르기 때문).
function iconDrawer(maskable, fullBleed = maskable) {
  return (x, y, size) => {
    const pad = maskable ? size * 0.14 : 0
    // 둥근 사각형 배경
    const radius = size * 0.22
    const inset = maskable ? 0 : 0
    const inField =
      fullBleed ||
      (x >= inset &&
      y >= inset &&
      x < size - inset &&
      y < size - inset &&
      insideRoundRect(x, y, inset, inset, size - inset, size - inset, radius))

    // 책/리포트 글리프 영역 (가운데)
    const gx0 = pad + size * 0.26
    const gx1 = size - pad - size * 0.26
    const gy0 = pad + size * 0.22
    const gy1 = size - pad - size * 0.22
    const inGlyph = x >= gx0 && x <= gx1 && y >= gy0 && y <= gy1

    // 글리프 안의 텍스트 라인 (리포트 줄)
    const lineH = (gy1 - gy0) / 6
    let onLine = false
    if (inGlyph) {
      const lx0 = gx0 + (gx1 - gx0) * 0.16
      const lx1 = gx1 - (gx1 - gx0) * 0.16
      for (let i = 1; i <= 3; i++) {
        const ly = gy0 + lineH * (i + 0.6)
        if (
          Math.abs(y - ly) <= lineH * 0.22 &&
          x >= lx0 &&
          x <= (i === 3 ? lx0 + (lx1 - lx0) * 0.6 : lx1)
        ) {
          onLine = true
        }
      }
    }

    if (!inField) return [0, 0, 0, 0]
    if (onLine) return [...BRAND, 255]
    if (inGlyph) return [...WHITE, 255]
    return [...BRAND, 255]
  }
}

function insideRoundRect(x, y, x0, y0, x1, y1, r) {
  const cxMin = x0 + r
  const cxMax = x1 - r
  const cyMin = y0 + r
  const cyMax = y1 - r
  let dx = 0
  let dy = 0
  if (x < cxMin) dx = cxMin - x
  else if (x > cxMax) dx = x - cxMax
  if (y < cyMin) dy = cyMin - y
  else if (y > cyMax) dy = y - cyMax
  return dx * dx + dy * dy <= r * r
}

function save(rel, buf) {
  const abs = resolve(root, rel)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, buf)
  console.log('wrote', rel, buf.length, 'bytes')
}

save('public/icons/icon-192.png', makePng(192, iconDrawer(false)))
save('public/icons/icon-512.png', makePng(512, iconDrawer(false)))
save('public/icons/icon-maskable-512.png', makePng(512, iconDrawer(true)))
save('public/apple-touch-icon.png', makePng(180, iconDrawer(false, true)))
