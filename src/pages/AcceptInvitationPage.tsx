import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { buildPath, PATHS } from '@/constants/paths'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { homePathForRole } from '@/features/auth/utils/roleHome'
import { AcceptInvitation } from '@/features/properties/components/AcceptInvitation'

export default function AcceptInvitationPage() {
  const { token = '' } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <AcceptInvitation
      token={token}
      signedInEmail={user?.email ?? null}
      onAccepted={({ propertyId }) => {
        toast.success('Invitation accepted')
        if (!user) return
        navigate(
          user.globalRole === 'CUSTOMER'
            ? buildPath(PATHS.CUSTOMER_PROPERTY_DETAIL, { id: propertyId })
            : homePathForRole(user.globalRole),
          { replace: true },
        )
      }}
    />
  )
}
