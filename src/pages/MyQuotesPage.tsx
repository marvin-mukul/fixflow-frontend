import { PageHeader } from '@/components/common/PageHeader'
import { MyQuotes } from '@/features/quotes/components/MyQuotes'

export default function MyQuotesPage() {
  return (
    <>
      <PageHeader title="My quotes" description="Every quote you have sent, newest first." />
      <MyQuotes />
    </>
  )
}
