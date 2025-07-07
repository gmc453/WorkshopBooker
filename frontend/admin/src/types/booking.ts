export type Booking = {
  id: string
  slotStartTime: string
  slotEndTime: string
  status: string
  serviceId: string
  serviceName: string
  servicePrice: number
  userName?: string
  workshopId?: string
  workshopName?: string
}