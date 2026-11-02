import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LocationPicker } from '@/components/common/map/LocationPicker'
import { LeadsMap } from '@/components/common/map/LeadsMap'
import { PropertyMap } from '@/components/common/map/PropertyMap'

describe('map components without a Mapbox token', () => {
  it('LocationPicker falls back to manual lat/lng inputs with a warning', async () => {
    const onChange = vi.fn()
    render(<LocationPicker value={null} onChange={onChange} />)

    expect(screen.getByText('Map unavailable')).toBeInTheDocument()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Latitude'), '30.3165')
    await user.type(screen.getByLabelText('Longitude'), '78.0322')

    expect(onChange).toHaveBeenLastCalledWith({ lat: 30.3165, lng: 78.0322 })
  })

  it('PropertyMap renders a static coordinate card', () => {
    render(<PropertyMap location={{ lat: 30.3165, lng: 78.0322 }} label="Home" />)
    expect(screen.getByText('Map unavailable')).toBeInTheDocument()
    expect(screen.getByText('30.31650, 78.03220')).toBeInTheDocument()
  })

  it('LeadsMap lists lead coordinates instead of a map', () => {
    render(
      <LeadsMap
        center={{ lat: 30.3, lng: 78 }}
        radiusKm={10}
        leads={[{ id: 'r1', title: 'Leaking tap', lat: 30.32, lng: 78.03 }]}
      />,
    )
    expect(screen.getByText('Map unavailable')).toBeInTheDocument()
    expect(screen.getByText('Leaking tap')).toBeInTheDocument()
  })
})
