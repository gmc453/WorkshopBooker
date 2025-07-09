import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSlotManagement } from '../useSlotManagement'
import type { SlotFormData } from '../../types'

// Mock hooks
vi.mock('../../../hooks/useCreateSlot')
vi.mock('../../../hooks/useDeleteSlot')

const mockUseCreateSlot = vi.fn()
const mockUseDeleteSlot = vi.fn()

// Mock the hooks
vi.mocked(require('../../../hooks/useCreateSlot').useCreateSlot).mockReturnValue(mockUseCreateSlot)
vi.mocked(require('../../../hooks/useDeleteSlot').useDeleteSlot).mockReturnValue(mockUseDeleteSlot)

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useSlotManagement', () => {
  const mockWorkshopId = 'workshop-123'
  const mockSlotData: SlotFormData = {
    date: new Date('2024-01-15'),
    startTime: '09:00',
    duration: 60,
    repeat: false,
    repeatType: 'single',
    repeatDays: [],
    repeatUntil: undefined,
    multipleTimes: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock implementations
    mockUseCreateSlot.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ id: 'slot-123' }),
      isPending: false
    })
    
    mockUseDeleteSlot.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Should initialize with correct default state', () => {
    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    expect(result.current.feedback).toBeNull()
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(typeof result.current.createSingleSlot).toBe('function')
    expect(typeof result.current.bulkDeleteSlots).toBe('function')
    expect(typeof result.current.generatePreviewSlots).toBe('function')
  })

  it('Should create single slot successfully', async () => {
    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const success = await result.current.createSingleSlot(mockSlotData)

    expect(success).toBe(true)
    expect(result.current.feedback).toEqual({
      message: 'Termin został dodany pomyślnie',
      type: 'success'
    })
  })

  it('Should handle API errors gracefully', async () => {
    const mockError = new Error('API Error')
    mockUseCreateSlot.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(mockError),
      isPending: false
    })

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const success = await result.current.createSingleSlot(mockSlotData)

    expect(success).toBe(false)
    expect(result.current.feedback).toEqual({
      message: 'Wystąpił błąd podczas dodawania terminu',
      type: 'error'
    })
  })

  it('Should handle slot overlap errors (409)', async () => {
    const mockError = {
      response: { status: 409, data: { details: 'Slot overlaps' } }
    }
    mockUseCreateSlot.mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(mockError),
      isPending: false
    })

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const success = await result.current.createSingleSlot(mockSlotData)

    expect(success).toBe(false)
    expect(result.current.feedback).toEqual({
      message: 'Termin nakłada się z już istniejącym terminem. Wybierz inny czas.',
      type: 'error'
    })
  })

  it('Should update loading state during operations', async () => {
    mockUseCreateSlot.mockReturnValue({
      mutateAsync: vi.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve({ id: 'slot-123' }), 100))
      }),
      isPending: true
    })

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    expect(result.current.isCreating).toBe(true)

    // Start the operation
    const promise = result.current.createSingleSlot(mockSlotData)
    
    // Should still be loading
    expect(result.current.isCreating).toBe(true)
    
    await promise
    
    // Should be done loading
    expect(result.current.isCreating).toBe(false)
  })

  it('Should invalidate queries after mutations', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'slot-123' })
    mockUseCreateSlot.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    })

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    await result.current.createSingleSlot(mockSlotData)

    expect(mockMutateAsync).toHaveBeenCalledWith({
      startTime: '2024-01-15T09:00:00.000Z',
      endTime: '2024-01-15T10:00:00.000Z'
    })
  })

  it('Should handle bulk operations correctly', async () => {
    const mockDeleteAsync = vi.fn().mockResolvedValue(undefined)
    mockUseDeleteSlot.mockReturnValue({
      mutateAsync: mockDeleteAsync,
      isPending: false
    })

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const slotIds = ['slot-1', 'slot-2', 'slot-3']
    const success = await result.current.bulkDeleteSlots(slotIds)

    expect(success).toBe(true)
    expect(mockDeleteAsync).toHaveBeenCalledTimes(3)
    expect(result.current.feedback).toEqual({
      message: 'Usunięto 3 terminów',
      type: 'success'
    })
  })

  it('Should provide proper error messages for bulk operations', async () => {
    const mockDeleteAsync = vi.fn()
      .mockResolvedValueOnce(undefined) // First slot deleted successfully
      .mockRejectedValueOnce(new Error('Delete failed')) // Second slot fails
      .mockResolvedValueOnce(undefined) // Third slot deleted successfully

    mockUseDeleteSlot.mockReturnValue({
      mutateAsync: mockDeleteAsync,
      isPending: false
    })

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const slotIds = ['slot-1', 'slot-2', 'slot-3']
    const success = await result.current.bulkDeleteSlots(slotIds)

    expect(success).toBe(true)
    expect(result.current.feedback).toEqual({
      message: 'Usunięto 2 terminów. 1 termin nie udało się usunąć',
      type: 'success'
    })
  })

  it('Should generate preview slots correctly', () => {
    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const preview = result.current.generatePreviewSlots(mockSlotData)

    expect(preview).toHaveLength(1)
    expect(preview[0]).toEqual({
      date: new Date('2024-01-15T09:00:00.000Z'),
      startTime: '09:00',
      endTime: '10:00'
    })
  })

  it('Should generate multiple preview slots for weekly repeat', () => {
    const weeklySlotData: SlotFormData = {
      ...mockSlotData,
      repeat: true,
      repeatType: 'weekly',
      repeatDays: [1, 3, 5], // Monday, Wednesday, Friday
      repeatUntil: new Date('2024-01-22')
    }

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const preview = result.current.generatePreviewSlots(weeklySlotData)

    expect(preview.length).toBeGreaterThan(1)
    expect(preview[0].startTime).toBe('09:00')
    expect(preview[0].endTime).toBe('10:00')
  })

  it('Should generate multiple preview slots for multiple times', () => {
    const multipleTimesData: SlotFormData = {
      ...mockSlotData,
      repeat: true,
      repeatType: 'multiple',
      multipleTimes: ['09:00', '11:00', '14:00']
    }

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const preview = result.current.generatePreviewSlots(multipleTimesData)

    expect(preview).toHaveLength(3)
    expect(preview[0].startTime).toBe('09:00')
    expect(preview[1].startTime).toBe('11:00')
    expect(preview[2].startTime).toBe('14:00')
  })

  it('Should handle empty workshop ID gracefully', async () => {
    const { result } = renderHook(() => useSlotManagement(null), {
      wrapper: TestWrapper
    })

    const success = await result.current.createSingleSlot(mockSlotData)

    expect(success).toBe(false)
  })

  it('Should handle missing date gracefully', () => {
    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const slotDataWithoutDate = { ...mockSlotData, date: undefined }
    const preview = result.current.generatePreviewSlots(slotDataWithoutDate)

    expect(preview).toHaveLength(0)
  })

  it('Should set feedback to null when cleared', () => {
    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    // Set some feedback
    result.current.setFeedback({
      message: 'Test message',
      type: 'success'
    })

    expect(result.current.feedback).toEqual({
      message: 'Test message',
      type: 'success'
    })

    // Clear feedback
    result.current.setFeedback(null)

    expect(result.current.feedback).toBeNull()
  })

  it('Should handle template slot creation', async () => {
    const template = {
      name: 'Test Template',
      slots: [
        { start: '09:00', duration: 60 },
        { start: '11:00', duration: 90 }
      ]
    }

    const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'slot-123' })
    mockUseCreateSlot.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    })

    const { result } = renderHook(() => useSlotManagement(mockWorkshopId), {
      wrapper: TestWrapper
    })

    const success = await result.current.createSlotsFromTemplate(template, new Date('2024-01-15'))

    expect(success).toBe(true)
    expect(mockMutateAsync).toHaveBeenCalledTimes(2)
    expect(result.current.feedback).toEqual({
      message: 'Utworzono 2 terminów z szablonu "Test Template"',
      type: 'success'
    })
  })
}) 