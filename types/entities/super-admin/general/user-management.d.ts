export interface UserManagementUser {
    id: string;
    email: string | null;
    phone: string;
    name: string;
    profile: string;
    active_status: boolean;
    block_status: boolean;
    google_id: string | null;
    last_login: string;
    internal_notes: string;
    createdAt: string;
}

export interface UserProfile {
    id: string;
    createdAt: string;
    user: UserManagementUser;
}

export interface UserManagementItem extends Record<string, unknown> {
    id: string;
    loyaltyPoints: number;
    defaultAddressId: string | null;
    dateOfBirth: string | null;
    userProfile: UserProfile;
}

export type RegistrationMethod = 'manual' | 'google';
export type AccountStatus = 'active' | 'inactive' | 'blocked';


export interface UMUserProfileUser {
    id: string;
    email: string | null;
    phone: string;
    password: string | null;
    name: string;
    email_is_verified: boolean;
    phone_is_verified: boolean;
    fcm_token: string | null;
    profile: string;
    active_status: boolean;
    block_status: boolean;
    google_id: string | null;
    current_location: string | null;
    last_login: string;
    tokenVersion: number;
    role_id: string | null;
    two_factor_enabled: boolean;
    internal_notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface UMUserProfile {
    id: string;
    createdAt: string;
    updatedAt: string;
    user_type_id: string;
    user_id: string;
    user: UMUserProfileUser;
}

export interface UMUserDetails extends Record<string, unknown> {
    id: string;
    loyaltyPoints: number;
    defaultAddressId: string | null;
    dateOfBirth: string | null;
    user_profile_id: string;
    userProfile: UMUserProfile;
    totalReviewsGiven: number;
    averageRatingGiven: number;
}
