import { Link, Outlet } from 'react-router'
import { BrandMark } from '@/components/layout/BrandMark'
import { PATHS } from '@/constants/paths'

/** Centered card layout (shadcn `login-03`) for login, register and change-password. */
export default function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link to={PATHS.HOME} className="self-center">
          <BrandMark className="text-lg" />
        </Link>
        <Outlet />
      </div>
    </div>
  )
}
