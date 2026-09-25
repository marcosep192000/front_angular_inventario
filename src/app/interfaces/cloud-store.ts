export interface CloudStore { id: number; companyId: number; name: string; slug: string | null; status: string; currency: string; createdAt: string; updatedAt: string; }
export interface CommercialSettings { description: string | null; logoUrl: string | null; bannerUrl: string | null; primaryColor: string | null; secondaryColor: string | null; whatsapp: string | null; phone: string | null; address: string | null; businessHours: string | null; welcomeMessage: string | null; pickupInstructions: string | null; backgroundColor: string | null; catalogEyebrow: string | null; catalogTitle: string | null; catalogSubtitle: string | null; primaryTextColor: string | null; secondaryTextColor: string | null; }
export interface CloudCommercial { storeId: number; companyId: number; settings: CommercialSettings; }
export interface ScheduleDay { dayOfWeek: number; enabled: boolean; opens: string | null; closes: string | null; }
export interface OrderSchedule { mode: 'ALWAYS_OPEN' | 'SCHEDULED' | 'TEMPORARILY_CLOSED'; timezone: string; days: ScheduleDay[]; }
export interface DeliveryZone { id: number; name: string; description: string | null; city: string | null; shippingCost: number; minimumOrderAmount: number | null; active: boolean; sortOrder: number; }
export interface DeliveryZoneRequest { name: string; description: string | null; city: string | null; shippingCost: number; minimumOrderAmount: number | null; active: boolean; sortOrder: number; }
export interface MercadoPagoStatus { enabled: boolean; configured: boolean; }
