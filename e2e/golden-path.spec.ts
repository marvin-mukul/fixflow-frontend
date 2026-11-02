import path from 'node:path'
import { expect, test, type Browser, type Page } from '@playwright/test'

/**
 * Golden path across three users, each in their own browser context:
 * tenant raises → owner approves → plumber quotes (masked lead) → owner accepts →
 * plumber works the job → tenant confirms → owner pays (mock) → everyone reviews.
 * Uses the backend seed (see `db:e2e-reset`).
 */
const PASSWORD = 'Demo@123'
const USERS = {
  tenant: 'tenant@demo.fixflow',
  owner: 'owner@demo.fixflow',
  plumber: 'plumber1@demo.fixflow',
} as const
const PLUMBER_NAME = 'Ravi Plumber'
const STREET = 'Green Residency'
const PHOTO = path.join(import.meta.dirname, 'fixtures', 'leak.png')
const TITLE = `Kitchen sink leaking ${Date.now()}`

async function signIn(browser: Browser, email: string): Promise<Page> {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).not.toHaveURL(/\/login/)
  return page
}

async function submitReview(page: Page, form: string) {
  const review = page.getByRole('form', { name: form })
  await review.getByRole('button', { name: 'Overall: 5 stars' }).click()
  await review.getByLabel('Comment (optional)').fill('Smooth job, thanks!')
  await review.getByRole('button', { name: 'Submit review' }).click()
  await expect(page.getByText('Your review', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit review' })).toBeVisible()
}

test('golden path: raise, approve, quote, accept, work, confirm, pay, review', async ({ browser }) => {
  const tenant = await signIn(browser, USERS.tenant)
  const owner = await signIn(browser, USERS.owner)
  const plumber = await signIn(browser, USERS.plumber)
  let requestUrl = ''

  await test.step('tenant raises a plumbing request with a photo', async () => {
    await tenant.goto('/app/requests/new')
    await expect(tenant.getByRole('heading', { name: 'Raise a repair request' })).toBeVisible()
    await tenant.getByLabel('Category').click()
    await tenant.getByRole('option', { name: 'Plumbing' }).click()
    await tenant.getByLabel('Title').fill(TITLE)
    await tenant.getByLabel('Description').fill('Water drips under the sink whenever the tap runs.')
    await tenant.getByLabel('Drop photos here or click to browse').setInputFiles(PHOTO)
    await expect(tenant.getByRole('img', { name: 'leak.png' })).toBeVisible()
    await tenant.getByRole('button', { name: 'Raise request' }).click()
    await expect(tenant).toHaveURL(/\/app\/requests\/[^/]+$/)
    await expect(tenant.getByRole('heading', { name: TITLE })).toBeVisible()
    requestUrl = new URL(tenant.url()).pathname
  })
  const requestId = requestUrl.split('/').pop()!

  await test.step('owner approves it in the approvals inbox', async () => {
    await owner.goto('/app/approvals')
    await owner.getByRole('button', { name: `Approve ${TITLE}` }).click()
    const dialog = owner.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Approve', exact: true }).click()
    await expect(owner.getByText(`Approved “${TITLE}”`)).toBeVisible()
  })

  await test.step('plumber sees a masked lead and quotes', async () => {
    await plumber.goto('/worker/leads')
    await plumber.getByRole('table', { name: 'Leads' }).getByText(TITLE).click()
    await expect(plumber).toHaveURL(new RegExp(`/worker/leads/${requestId}$`))
    await expect(plumber.getByRole('heading', { name: TITLE })).toBeVisible()
    await expect(plumber.getByText('Exact address hidden')).toBeVisible()
    await expect(plumber.getByTestId('lead-address')).toHaveCount(0)
    await expect(plumber.getByText(STREET)).toHaveCount(0)
    await plumber.getByLabel('Labour (₹)').fill('500')
    await plumber.getByRole('button', { name: 'Send quote' }).click()
    await expect(plumber.getByText('Quote sent')).toBeVisible()
    await expect(plumber.getByText('Your quote Submitted')).toBeVisible()
  })

  await test.step('owner accepts the quote', async () => {
    await owner.goto(requestUrl)
    await owner.getByRole('button', { name: `Accept quote from ${PLUMBER_NAME}` }).click()
    await owner.getByRole('alertdialog').getByRole('button', { name: 'Accept quote' }).click()
    await expect(owner.getByText(`Accepted ${PLUMBER_NAME}'s quote`)).toBeVisible()
  })

  await test.step('plumber goes en route, arrives, starts and completes with an after photo', async () => {
    await plumber.goto('/worker/jobs')
    await plumber.getByRole('table', { name: 'Jobs' }).getByText(TITLE).click()
    await expect(plumber).toHaveURL(/\/worker\/jobs\/[^/]+$/)
    await expect(plumber.getByText(STREET)).toBeVisible()
    for (const [button, toast] of [
      ["I'm on my way", 'Customer notified that you are on the way'],
      ['Mark arrived', 'Marked as arrived'],
      ['Start work', 'Work started'],
    ] as const) {
      await plumber.getByRole('button', { name: button }).click()
      await expect(plumber.getByText(toast)).toBeVisible()
    }
    await plumber.getByRole('button', { name: 'Mark complete' }).click()
    const dialog = plumber.getByRole('dialog')
    await dialog.getByLabel('Add after photos').setInputFiles(PHOTO)
    await dialog.getByRole('button', { name: 'Complete job' }).click()
    await expect(plumber.getByText('Job completed')).toBeVisible()
  })

  await test.step('tenant confirms completion', async () => {
    await tenant.goto(requestUrl)
    await tenant.getByRole('button', { name: 'Confirm completion' }).click()
    await tenant.getByRole('alertdialog').getByRole('button', { name: 'Confirm completion' }).click()
    await expect(tenant.getByText('Awaiting payment')).toBeVisible()
  })

  await test.step('owner pays through the mock checkout and lands on the paid invoice', async () => {
    await owner.goto(requestUrl)
    await owner.getByRole('button', { name: /^Pay ₹590/ }).click()
    await expect(owner).toHaveURL(/\/pay\/mock\//)
    await owner.getByRole('button', { name: 'Pay (success)' }).click()
    await expect(owner).toHaveURL(/\/invoices\/[^/]+\?status=PAID/)
    await expect(owner.getByText('Payment received')).toBeVisible()
    await expect(owner.getByRole('heading', { name: /Invoice FF\// })).toBeVisible()
    await expect(owner.getByText('Paid', { exact: true }).first()).toBeVisible()
  })

  await test.step('tenant, owner and plumber each leave a review', async () => {
    await tenant.goto(requestUrl)
    await submitReview(tenant, 'Rate the worker')

    await owner.goto(requestUrl)
    await submitReview(owner, 'Rate the worker')

    await plumber.reload()
    await submitReview(plumber, 'Rate the customer')
  })
})
