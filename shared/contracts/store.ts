export interface TimeSlot {
  open: string;
  close: string;
}

export interface DayTimings {
  is_active: boolean;
  slots: TimeSlot[];
}

export interface StoreTimings {
  monday: DayTimings;
  tuesday: DayTimings;
  wednesday: DayTimings;
  thursday: DayTimings;
  friday: DayTimings;
  saturday: DayTimings;
  sunday: DayTimings;
}
