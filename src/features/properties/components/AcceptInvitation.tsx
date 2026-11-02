import { HomeIcon, MailWarningIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { buildPath, PATHS } from '@/constants/paths'
import {
  acceptInvitation,
  fetchInvitation,
  selectInvitationState,
} from '@/features/properties/store/propertiesSlice'
import type { InvitationAccepted } from '@/features/properties/types/property.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { formatDate } from '@/utils/format'

const PREVIEW_ERRORS: Record<string, { title: string; description: string }> = {
  INVITATION_USED: {
    title: 'Invitation already used',
    description: 'This invitation has already been accepted. Log in to see the property.',
  },
  INVITATION_EXPIRED: {
    title: 'Invitation expired',
    description: 'Ask the property owner to send you a new invitation.',
  },
}

interface AcceptInvitationProps {
  token: string
  /** Email of the signed-in user, or null for guests. */
  signedInEmail: string | null
  onAccepted: (result: InvitationAccepted) => void
}

export function AcceptInvitation({ token, signedInEmail, onAccepted }: AcceptInvitationProps) {
  const dispatch = useAppDispatch()
  const { preview, status, error } = useAppSelector(selectInvitationState)
  const [accepting, setAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)

  useEffect(() => {
    void dispatch(fetchInvitation(token))
  }, [dispatch, token])

  if (status === 'idle' || status === 'loading') return <Loader label="Loading invitation…" />

  if (!preview) {
    const known = error ? PREVIEW_ERRORS[error.code] : undefined
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={<MailWarningIcon />}
            title={known?.title ?? 'Invitation not found'}
            description={known?.description ?? error?.message ?? 'Check the link in your email.'}
            action={
              <Link to={PATHS.LOGIN} className={buttonVariants({ variant: 'outline' })}>
                Go to login
              </Link>
            }
          />
        </CardContent>
      </Card>
    )
  }

  const here = { pathname: buildPath(PATHS.ACCEPT_INVITATION, { token }), search: '', hash: '' }
  const emailMismatch =
    signedInEmail !== null && signedInEmail.toLowerCase() !== preview.email.toLowerCase()

  const accept = async () => {
    setAccepting(true)
    setAcceptError(null)
    try {
      onAccepted(await dispatch(acceptInvitation(token)).unwrap())
    } catch (err) {
      const apiError = toApiError(err)
      setAcceptError(
        apiError.code === 'INVITATION_EMAIL_MISMATCH'
          ? `This invitation was sent to ${preview.email}. Log in with that account to accept it.`
          : apiError.message,
      )
    } finally {
      setAccepting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
          <HomeIcon className="size-6" />
        </div>
        <CardTitle className="text-xl">You're invited to {preview.propertyLabel}</CardTitle>
        <CardDescription>
          {preview.inviterName} invited <strong>{preview.email}</strong> to join as{' '}
          {preview.type === 'TENANT' ? 'a tenant' : 'the owner'} in {preview.city}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-center text-sm text-muted-foreground">
        <p>Expires on {formatDate(preview.expiresAt)}.</p>
        {emailMismatch && (
          <ErrorAlert
            title="Different account"
            message={`You're signed in as ${signedInEmail}. Accepting requires the invited account.`}
          />
        )}
        <ErrorAlert title="Could not accept the invitation" message={acceptError} />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {signedInEmail ? (
          <Button className="w-full" disabled={accepting} onClick={() => void accept()}>
            {accepting ? 'Accepting…' : 'Accept invitation'}
          </Button>
        ) : (
          <>
            <Link
              to={preview.needsRegistration ? PATHS.REGISTER : PATHS.LOGIN}
              state={{ from: here }}
              className={buttonVariants({ className: 'w-full' })}
            >
              {preview.needsRegistration ? 'Create an account to accept' : 'Log in to accept'}
            </Link>
            <Link
              to={preview.needsRegistration ? PATHS.LOGIN : PATHS.REGISTER}
              state={{ from: here }}
              className={buttonVariants({ variant: 'ghost', className: 'w-full' })}
            >
              {preview.needsRegistration ? 'I already have an account' : 'Create an account'}
            </Link>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
