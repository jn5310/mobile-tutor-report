// 화면 미리보기 스크린샷 스크립트
// CI(GitHub Actions)에서 빌드된 앱을 아이폰 크기 브라우저로 열어
// 샘플 데이터 생성 -> 리포트 작성(국어, 국수) -> 미리보기 -> 히스토리 -> 백업 순으로 화면을 찍습니다.
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
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(BASE).origin })
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

const btn = (name, exact = true) => page.getByRole('button', { name, exact }).first()

async function tab(label) {
  await page.locator('nav').getByRole('button', { name: label }).click()
  await page.waitForTimeout(300)
}

async function tapTimes(name, n) {
  for (let i = 0; i < n; i++) {
    await btn(name).click()
  }
}

// 앱의 'PNG 저장' 버튼으로 실제 내려받아지는 이미지(html-to-image 결과)를 그대로 저장합니다.
async function captureCard(name) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }),
    btn('PNG 저장').click(),
  ])
  await download.saveAs(`${OUT}/${name}.png`)
}

await page.goto(BASE, { waitUntil: 'networkidle' })

await step('01-empty', () => shot('01-empty'))

await step('02-students', async () => {
  await btn('샘플 학생 데이터 자동 생성').click()
  await shot('02-students', { full: true })
})

// 국어 학생(김서연) 리포트
await step('03-report-korean', async () => {
  await btn('김서연 리포트 쓰기').click()
  for (const label of ['비문학 독해', '문법(언매)', '지문 구조화 우수', '핵심어 포착 능숙', '선지 근거 찾기 연습 필요']) {
    await btn(label).click()
  }
  await btn('국어 점수 기록').click()
  await btn('80점').click()
  await btn('5점 올리기').click()
  await tapTimes('1점 올리기', 3)
  await btn('+ 오답 노트 정리').click()
  await btn('+ 지문 5세트 풀이').click()
  await btn('총평 자동 작성').click()
  await shot('03-report-korean', { full: true })
})

await step('04-preview-korean', async () => {
  await btn('저장하고 미리보기').click()
  await page.waitForTimeout(1200)
  await shot('04-preview-korean')
  await captureCard('05-card-korean')
})

await step('06-kakao-text', async () => {
  await btn('카톡 글 복사').click()
  await page.waitForTimeout(300)
  const text = await page.evaluate(() => navigator.clipboard.readText())
  await writeFile(`${OUT}/06-kakao-text.txt`, text, 'utf8')
  await btn('카카오톡으로 보낼 글 미리보기').click()
  await page.locator('pre').first().scrollIntoViewIfNeeded()
  await shot('06-kakao-preview', { full: false })
})

await step('close-preview', async () => {
  await btn('닫기').click()
})

// 국수 학생(이지안) 리포트: 수학 오답 비율까지
await step('07-report-guksu', async () => {
  await tab('학생 관리')
  await btn('이지안 리포트 쓰기').click()
  await btn('어휘').click()
  await btn('문맥 추론 정확도 우수').click()
  await btn('추론적 사고 강화 필요').click()
  await page.locator('#math-unit').fill('이차함수의 활용')
  await page.getByRole('radio', { name: /^상/ }).click()
  await tapTimes('계산 실수', 3)
  await tapTimes('문제 조건 해석 오류', 2)
  await tapTimes('풀이 과정 생략', 1)
  await btn('국어 점수 기록').click()
  await btn('90점').click()
  await tapTimes('1점 올리기', 2)
  await btn('수학 점수 기록').click()
  await page.getByRole('button', { name: '80점', exact: true }).nth(1).click()
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '1점 올리기', exact: true }).nth(1).click()
  }
  await page.getByRole('radio', { name: '약점 보완 중심' }).click()
  await btn('총평 자동 작성').click()
  await shot('07-report-guksu', { full: true })
})

await step('08-card-guksu', async () => {
  await btn('저장하고 미리보기').click()
  await page.waitForTimeout(1200)
  await captureCard('08-card-guksu')
  await btn('닫기').click()
})

await step('09-history', async () => {
  await tab('히스토리')
  await shot('09-history', { full: true })
})

await step('10-backup', async () => {
  await tab('데이터 백업')
  await page.locator('#teacher-name').fill('김민지')
  await page.locator('#academy-name').fill('민지쌤 국어·수학')
  await btn('저장').click()
  await shot('10-backup', { full: true })
})

await step('11-student-form', async () => {
  await tab('학생 관리')
  await btn('학생 추가').click()
  await shot('11-student-form')
  await btn('취소').click()
})

await step('12-students-after', async () => {
  await shot('12-students-after', { full: true })
})

await browser.close()

if (failures.length > 0) {
  console.error(`실패한 단계: ${failures.join(', ')}`)
  process.exitCode = 1
}
