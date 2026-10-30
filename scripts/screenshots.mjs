// 화면 미리보기 스크린샷 스크립트
// CI(GitHub Actions)에서 빌드된 앱을 아이폰 크기 브라우저로 열어
// 샘플 데이터 생성 -> 리포트 작성 -> 미리보기 -> 히스토리 -> 백업 순으로 화면을 찍습니다.
// 로컬 실행: npm run build && npx vite preview --port 4173 & node scripts/screenshots.mjs

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const OUT = process.env.OUT_DIR || 'shots'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'ko-KR',
  timezoneId: 'Asia/Seoul',
})
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE })
const page = await ctx.newPage()
page.on('dialog', (d) => d.accept())
page.on('pageerror', (e) => console.error('[pageerror]', e.message))

const failures = []

async function step(name, fn) {
  try {
    await fn()
    console.log('ok  ', name)
  } catch (err) {
    failures.push(name)
    console.error('FAIL', name, err instanceof Error ? err.message : err)
  }
}

async function shot(name, { full = false } = {}) {
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
}

async function tap(name) {
  await page.getByRole('button', { name }).first().click()
}

async function tab(label) {
  await page.locator('nav').getByRole('button', { name: label }).click()
  await page.waitForTimeout(300)
}

await page.goto(BASE, { waitUntil: 'networkidle' })

await step('01-empty', () => shot('01-empty'))

await step('02-students', async () => {
  await tap(/샘플/)
  await shot('02-students', { full: true })
})

await step('03-report-builder', async () => {
  await tab(/리포트/)
  for (const label of ['비문학 독해', '문법(언매)', '지문 구조화 우수', '선지 근거 찾기 연습 필요']) {
    await page.getByRole('button', { name: label, exact: true }).first().click().catch(() => {})
  }
  await page.getByRole('button', { name: /국어.*(점수|기록)/ }).first().click().catch(() => {})
  await page.getByRole('button', { name: '증가' }).first().click({ clickCount: 3 }).catch(() => {})
  await shot('03-report-builder', { full: true })
})

await step('04-compose', async () => {
  await tap(/총평/)
  await page.waitForTimeout(300)
  await shot('04-compose', { full: true })
})

await step('05-preview', async () => {
  await tap(/저장/)
  await page.waitForTimeout(800)
  await shot('05-preview')
})

await step('06-report-card', async () => {
  const card = page.locator('[data-shot="report-card"], div[style*="width: 360px"]').first()
  await card.screenshot({ path: `${OUT}/06-report-card.png` })
})

await step('07-kakao-text', async () => {
  await tap(/텍스트|카카오톡/)
  await page.waitForTimeout(300)
  const text = await page.evaluate(() => navigator.clipboard.readText())
  await writeFile(`${OUT}/07-kakao-text.txt`, text, 'utf8')
})

await step('close-preview', async () => {
  await page.getByRole('button', { name: '닫기' }).first().click()
})

await step('08-history', async () => {
  await tab(/히스토리/)
  await shot('08-history', { full: true })
})

await step('09-backup', async () => {
  await tab(/백업/)
  await shot('09-backup', { full: true })
})

await step('10-student-form', async () => {
  await tab(/학생/)
  await tap(/학생 추가|추가/)
  await shot('10-student-form')
})

await browser.close()

if (failures.length > 0) {
  console.error(`실패한 단계: ${failures.join(', ')}`)
}
