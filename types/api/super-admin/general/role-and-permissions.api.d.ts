import { Permission } from "@/types/entities/super-admin/general/permission";
import { RoleUser } from "@/types/entities/super-admin/general/role-user";

export type ModulePermissions = Record<string, Permission[]>;

export type PermissionsResponse = Record<string, ModulePermissions>;

export interface RoleUsersResponse {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    data: RoleUser[];
}

export interface RoleUsersParams {
    limit?: number;
    page?: number;
    search?: string;
}

export interface CreateRolePayload {
    name: string;
    description: string;
    userIds: string[];
    permissions: string[];
}

export interface CreateRoleResponse {
    message: string;
}

export interface RolePermission {
    id: string;
    name: string;
    main_module: string;
    module: string;
}

export interface AssignedUser {
    id: string;
    email: string | null;
    phone: string;
    name: string;
    profile: string;
}

export interface Role extends Record<string, unknown> {
    id: string;
    name: string;
    description: string;
    active_status: boolean;
    permissions: RolePermission[];
    users: AssignedUser[];
}

export interface GetRolesResponse {
    data: Role[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ToggleRoleStatusPayload {
    roleId: string;
}

export interface ToggleRoleStatusResponse {
    message: string;
    status: boolean;
}

export interface DeleteRolePayload {
    roleId: string;
}

export interface DeleteRoleResponse {
    message: string;
}

export interface AssignRoleToUserPayload {
    userId: string;
    roleId: string;
}

export interface AssignRoleToUserResponse {
    message: string;
}

export interface UpdateRolePayload {
    roleId: string;
    name: string;
    description: string;
    permissionsToAdd: string[];
    permissionsToRemove: string[];
    usersToAdd: string[];
    usersToRemove: string[];
}

export interface UpdateRoleResponse {
    message: string;
}

export interface GetRoleByIdResponse {
    id: string;
    name: string;
    description: string;
    active_status: boolean;
    permissions: Permission[];
    users: AssignedUser[];
}

export interface InviteUserPayload {
    roleId?: string;
    email: string;
    fullName: string;
    password?: string; // Password can be optional if system generates it
    mustChangePassword: boolean;
}

export type InviteUserResponse = MessageResponse;

export interface RoleItemForInvite {
    id: string;
    name: string;
    description: string;
    active_status: boolean;
}

export interface GetAllRoleForInviteResponse {
    data: RoleItemForInvite[];
}
