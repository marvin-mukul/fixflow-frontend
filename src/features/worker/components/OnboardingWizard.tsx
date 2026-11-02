import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Loader } from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PATHS } from '@/constants/paths'
import { CategoriesForm } from '@/features/worker/components/CategoriesForm'
import { IdDocumentForm } from '@/features/worker/components/IdDocumentForm'
import { ProfileForm } from '@/features/worker/components/ProfileForm'
import { useWorkerProfile } from '@/features/worker/hooks/useWorker'
import type { WorkerProfile } from '@/features/worker/types/worker.types'
import { cn } from '@/lib/utils'

const STEPS = [
  { title: 'Profile', description: 'Where you work from and how far you travel.' },
  { title: 'Categories', description: 'The trades you offer.' },
  { title: 'ID document', description: 'For admin verification. JPG, PNG, WEBP or PDF up to 5 MB.' },
] as const

function firstIncompleteStep(profile: WorkerProfile | null): number {
  if (!profile) return 0
  if (profile.categories.length === 0) return 1
  if (!profile.hasIdDocument) return 2
  return 0
}

/** Profile → categories → ID document. Resumes at the first incomplete step. */
export function OnboardingWizard() {
  const { profile, loading, missing, error } = useWorkerProfile()
  if (loading) return <Loader />
  if (!profile && !missing) return <ErrorAlert title="Could not load your profile" message={error?.message} />
  return <WizardSteps initialProfile={profile} />
}

function WizardSteps({ initialProfile }: { initialProfile: WorkerProfile | null }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(() => firstIncompleteStep(initialProfile))
  const [profile, setProfile] = useState(initialProfile)

  const finish = () => {
    toast.success('Onboarding complete', { description: 'An admin will verify your ID shortly.' })
    navigate(PATHS.WORKER_HOME, { replace: true })
  }

  const current = STEPS[step]!
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Progress value={((step + 1) / STEPS.length) * 100} aria-label="Onboarding progress" />
        <ol className="grid grid-cols-3 gap-2 text-sm">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className={cn(
                'flex items-center gap-2',
                i === step ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border text-xs',
                  i < step && 'border-primary bg-primary text-primary-foreground',
                  i === step && 'border-primary',
                )}
              >
                {i < step ? <CheckIcon className="size-3.5" /> : i + 1}
              </span>
              {s.title}
            </li>
          ))}
        </ol>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Step {step + 1}: {current.title}
          </CardTitle>
          <CardDescription>{current.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <ProfileForm
              profile={profile}
              submitLabel="Save and continue"
              onSaved={(saved) => {
                setProfile(saved)
                setStep(1)
              }}
            />
          )}
          {step === 1 && profile && (
            <CategoriesForm
              profile={profile}
              submitLabel="Save and continue"
              onSaved={(saved) => {
                setProfile(saved)
                setStep(2)
              }}
            />
          )}
          {step === 2 && profile && (
            <div className="flex flex-col gap-4">
              <IdDocumentForm profile={profile} submitLabel="Upload and finish" onSaved={finish} />
              {profile.hasIdDocument && (
                <Button variant="ghost" className="self-end" onClick={finish}>
                  Keep current document and finish
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {step > 0 && (
        <Button variant="ghost" className="self-start" onClick={() => setStep(step - 1)}>
          Back
        </Button>
      )}
    </div>
  )
}
