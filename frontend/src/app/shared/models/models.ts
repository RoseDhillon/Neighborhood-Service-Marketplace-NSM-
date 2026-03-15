export interface UserDto {
  id: string
  name: string
  email: string
  role: "resident" | "provider"
}

export interface CategoryDto {
  _id: string
  name: string
  description?: string
}

export interface ServiceRequestDto {
  _id: string
  title: string
  description: string
  category: CategoryDto
  location: string
  resident: UserDto
  status: "open" | "quoted" | "assigned" | "completed" | "cancelled"
  assignedProvider?: UserDto
  createdAt: string
  updatedAt: string
}

export interface QuoteDto {
  _id: string
  request: ServiceRequestDto | string
  provider: UserDto
  price: number
  daysToComplete: number
  message?: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export interface PopulatedQuoteDto {
  _id: string
  request: ServiceRequestDto
  provider: UserDto
  price: number
  daysToComplete: number
  message?: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}
