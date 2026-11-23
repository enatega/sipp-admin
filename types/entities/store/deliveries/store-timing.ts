export type TWeekDay =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export interface ITimeSlot {
    open: string;
    close: string;
}

export interface IDayTiming {
    slots: ITimeSlot[];
    is_active: boolean;
}

export type IStoreTimings = Record<TWeekDay, IDayTiming>;