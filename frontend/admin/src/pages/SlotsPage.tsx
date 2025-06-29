import { useState } from 'react'
import { useMyWorkshops } from '../hooks/useMyWorkshops'
import { useWorkshopSlots } from '../hooks/useWorkshopSlots'
import { useCreateSlot } from '../hooks/useCreateSlot'
import { useDeleteSlot } from '../hooks/useDeleteSlot'

export default function SlotsPage() {
  const { data: workshops } = useMyWorkshops()
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null)
  const { data: slots, refetch } = useWorkshopSlots(selectedWorkshopId ?? '')
  const createSlot = useCreateSlot(selectedWorkshopId ?? '')
  const deleteSlot = useDeleteSlot()

  const handleCreate = async () => {
    const start = prompt('Start time (ISO)')
    const end = prompt('End time (ISO)')
    if (!start || !end) return
    await createSlot.mutateAsync({ startTime: start, endTime: end })
    refetch()
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Zarządzanie slotami</h1>
      <select value={selectedWorkshopId ?? ''} onChange={e => setSelectedWorkshopId(e.target.value)}>
        <option value="">Wybierz warsztat</option>
        {workshops?.map(w => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      {selectedWorkshopId && (
        <div className="space-y-2">
          <button onClick={handleCreate} className="px-2 py-1 bg-blue-600 text-white">Dodaj slot</button>
          <ul>
            {slots?.map(s => (
              <li key={s.id} className="flex justify-between">
                <span>{new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleTimeString()}</span>
                <button onClick={async () => { await deleteSlot.mutateAsync(s.id); refetch(); }}>Usuń</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
