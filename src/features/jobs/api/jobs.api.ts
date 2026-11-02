import type { CompleteJobPayload, Job, WorkerJobAction } from '@/features/jobs/types/job.types'
import { api } from '@/lib/axios'
import type { CursorPage } from '@/types/api'

const ACTION_PATHS: Record<Exclude<WorkerJobAction, 'complete'>, string> = {
  en_route: 'en-route',
  arrive: 'arrive',
  start: 'start',
}

export const jobsApi = {
  /** Jobs assigned to the signed-in worker. */
  async workerJobs(active: boolean, cursor?: string | null, limit = 20) {
    const { data } = await api.get<CursorPage<Job>>('/worker/jobs', {
      params: { active, cursor: cursor ?? undefined, limit },
    })
    return data
  },
  async get(id: string) {
    const { data } = await api.get<Job>(`/jobs/${id}`)
    return data
  },
  async progress(id: string, action: Exclude<WorkerJobAction, 'complete'>) {
    const { data } = await api.post<Job>(`/jobs/${id}/${ACTION_PATHS[action]}`)
    return data
  },
  async complete(id: string, { files, finalAmountPaise }: CompleteJobPayload) {
    const form = new FormData()
    for (const file of files) form.append('files', file)
    if (finalAmountPaise !== undefined) form.append('finalAmountPaise', String(finalAmountPaise))
    const { data } = await api.post<Job>(`/jobs/${id}/complete`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  async confirm(id: string) {
    const { data } = await api.post<{ job: Job }>(`/jobs/${id}/confirm`)
    return data.job
  },
  async dispute(id: string, reason: string) {
    const { data } = await api.post<Job>(`/jobs/${id}/dispute`, { reason })
    return data
  },
}
