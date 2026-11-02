import { PageHeader } from '@/components/common/PageHeader'
import { CategoryManager } from '@/features/admin/components/CategoryManager'

export default function AdminCategoriesPage() {
  return (
    <>
      <PageHeader title="Categories" description="Repair categories workers offer and customers request." />
      <CategoryManager />
    </>
  )
}
