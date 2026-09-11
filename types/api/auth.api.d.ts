import { AdminProfile } from "../entities/auth";
import { User } from "../entities/super-admin/general/user";
import { ShopMode } from "../entities/super-admin/enatega-deliveries/settings";
import { ItemDetailResponse, MessageResponse, PaginatedResponse } from "./common";

export type GetUsersResponse = PaginatedResponse<User>;
export type GetUserDetailsResponse = ItemDetailResponse<User>;

export interface UpdatePasswordRequiredPayload {
    userId: string;
    previous_password?: string;
    new_password: string;
}

export type UpdatePasswordRequiredResponse = MessageResponse;

export interface PostLoginPayload {
    email: string;
    password: string;
}

export interface PostLoginResponse {
    message: string;
    user: User;
    adminProfiles: AdminProfile[];
    accessToken: string;
    shopMode?: ShopMode;
}

export interface PostSendLoginOtpResponse {
    userId: string;
    message: string;
    sentTo: {
        phone: boolean;
        email: boolean;
    };
    shopMode?: ShopMode;
}

export type LoginApiResponse = PostLoginResponse | PostSendLoginOtpResponse;

export interface PostSendLoginOtpPayload {
    email: string;
    password?: string;
    otp_type: 'sms' | 'email';
}

export interface PostSendLoginOtpResponse {
    userId: string;
    message: string;
    sentTo: {
        phone: boolean;
        email: boolean;
    };
}

export interface PostSendOtpPayload {
    email: string;
}

export interface PostSendOtpResponse {
    message: string;
}

export type PostVerifyOtpPayload = {
    email: string;
    otp: string;
}

export interface PostResetPasswordPayload {
    userId: string;
    password: string;
}

export interface PostVerifyLoginOtpPayload {
    userId: string;
    sentOtp: string;
}

export interface Post2FaSendOtpResponse {
    userId: string;
    message: string;
    sentTo: {
        phone: boolean;
        email: boolean;
    };
}

export interface PostResetPasswordResponse {
    message: string;
}

export interface PostVerifyOtpResponse {
    message: string;
    userId: string;
}