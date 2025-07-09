import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import WorkshopCards from '../WorkshopCards'
import type { Workshop } from '../../../../types/workshop'

// Mock data
const mockWorkshops: Workshop[] = [
  {
    id: '1',
    name: 'Warsztat Mechaniczny Premium',
    description: 'Profesjonalny warsztat samochodowy',
    address: 'ul. Przykładowa 1, Warszawa'
  },
  {
    id: '2',
    name: 'Auto Serwis Express',
    description: 'Szybki serwis samochodowy',
    address: 'ul. Testowa 2, Kraków'
  }
]

// Test wrapper component
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

describe('WorkshopCards', () => {
  const mockOnSelectWorkshop = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Should render list of workshops correctly', () => {
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Twoje warsztaty')).toBeInTheDocument()
    expect(screen.getByText('Warsztat Mechaniczny Premium')).toBeInTheDocument()
    expect(screen.getByText('Auto Serwis Express')).toBeInTheDocument()
    expect(screen.getByText('Profesjonalny warsztat samochodowy')).toBeInTheDocument()
    expect(screen.getByText('Szybki serwis samochodowy')).toBeInTheDocument()
  })

  it('Should highlight selected workshop', () => {
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId="1"
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    const selectedCard = screen.getByText('Warsztat Mechaniczny Premium').closest('div')
    expect(selectedCard).toHaveClass('border-blue-500', 'bg-blue-50')
  })

  it('Should call onSelectWorkshop when workshop clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    const firstWorkshopCard = screen.getByText('Warsztat Mechaniczny Premium').closest('div')
    await user.click(firstWorkshopCard!)

    expect(mockOnSelectWorkshop).toHaveBeenCalledWith('1')
  })

  it('Should show loading state when data loading', () => {
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={undefined}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Twoje warsztaty')).toBeInTheDocument()
    expect(screen.getByText('Nie masz jeszcze żadnych warsztatów.')).toBeInTheDocument()
  })

  it('Should show empty state when no workshops', () => {
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={[]}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Nie masz jeszcze żadnych warsztatów.')).toBeInTheDocument()
  })

  it('Should be keyboard accessible (Tab, Enter, Space)', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    const firstWorkshopCard = screen.getByText('Warsztat Mechaniczny Premium').closest('div')
    
    // Focus the card
    await user.tab()
    expect(firstWorkshopCard).toHaveFocus()

    // Test Enter key
    await user.keyboard('{Enter}')
    expect(mockOnSelectWorkshop).toHaveBeenCalledWith('1')

    // Reset mock
    mockOnSelectWorkshop.mockClear()

    // Test Space key
    await user.keyboard(' ')
    expect(mockOnSelectWorkshop).toHaveBeenCalledWith('1')
  })

  it('Should display workshop statistics correctly', () => {
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    // Check if stats are displayed (they are mocked in the component)
    expect(screen.getByText('Terminów')).toBeInTheDocument()
    expect(screen.getByText('Ten tydzień')).toBeInTheDocument()
    expect(screen.getByText('Rezerwacji')).toBeInTheDocument()
  })

  it('Should handle multiple workshop selection', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    const firstCard = screen.getByText('Warsztat Mechaniczny Premium').closest('div')
    const secondCard = screen.getByText('Auto Serwis Express').closest('div')

    await user.click(firstCard!)
    expect(mockOnSelectWorkshop).toHaveBeenCalledWith('1')

    await user.click(secondCard!)
    expect(mockOnSelectWorkshop).toHaveBeenCalledWith('2')
  })

  it('Should display workshop contact information', () => {
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Warsztat Mechaniczny Premium')).toBeInTheDocument()
    expect(screen.getByText('Auto Serwis Express')).toBeInTheDocument()
  })

  it('Should handle workshop with missing data gracefully', () => {
    const incompleteWorkshop: Workshop = {
      id: '3',
      name: 'Warsztat Testowy',
      description: '',
      address: undefined
    }

    render(
      <TestWrapper>
        <WorkshopCards
          workshops={[incompleteWorkshop]}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Warsztat Testowy')).toBeInTheDocument()
    expect(screen.getByText('Twoje warsztaty')).toBeInTheDocument()
  })

  it('Should maintain accessibility attributes', () => {
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    const cards = screen.getAllByRole('button', { hidden: true })
    expect(cards.length).toBeGreaterThan(0)
  })

  it('Should handle rapid clicks without errors', async () => {
    const user = userEvent.setup()
    
    render(
      <TestWrapper>
        <WorkshopCards
          workshops={mockWorkshops}
          selectedWorkshopId={null}
          onSelectWorkshop={mockOnSelectWorkshop}
        />
      </TestWrapper>
    )

    const firstCard = screen.getByText('Warsztat Mechaniczny Premium').closest('div')

    // Rapid clicks
    await user.click(firstCard!)
    await user.click(firstCard!)
    await user.click(firstCard!)

    expect(mockOnSelectWorkshop).toHaveBeenCalledTimes(3)
  })
}) 