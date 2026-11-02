import { PageHeader } from '@/components/common/PageHeader'
import { OnboardingWizard } from '@/features/worker/components/OnboardingWizard'

export default function WorkerOnboardingPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title="Set up your worker profile" description="Three quick steps before you start receiving leads." />
      <OnboardingWizard />
    </div>
  )
}
