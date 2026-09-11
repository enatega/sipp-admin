import { default as Axios } from '@/config/axios';
import {
    ApiErrorResponse,
    AssignRoleToUserPayload,
    AssignRoleToUserResponse,
    CreateRolePayload,
    CreateRoleResponse,
    DeleteRolePayload,
    DeleteRoleResponse,
    GetAllRoleForInviteResponse,
    GetRoleByIdResponse,
    GetRolesResponse,
    InviteUserPayload,
    InviteUserResponse,
    PermissionsResponse,
    RoleUsersParams,
    RoleUsersResponse,
    ToggleRoleStatusPayload,
    ToggleRoleStatusResponse,
    UpdateRolePayload,
    UpdateRoleResponse,
} from '@/types';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    UseQueryOptions,
} from '@tanstack/react-query';
import { useQueryParams } from '@/hooks/use-query-params';

/**
 * Hook to fetch all permissions grouped by main module and module
 * @param options - React Query options
 * @returns Query result with permissions data
 */
export const useGetAllPermissions = (
    options?: Omit<
        UseQueryOptions<
            PermissionsResponse,
            ApiErrorResponse,
            PermissionsResponse,
            readonly unknown[]
        >,
        'queryKey' | 'queryFn'
    >,
) => {
    const queryKey = ['get-all-permissions'];
    return useQuery<PermissionsResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const res = await Axios.get<PermissionsResponse>('/roles/permissions');
            return res.data;
        },
        retry: false,
        ...options,
    });
};

/**
 * Hook to fetch users for role assignment with pagination
 * @param params - Query parameters (limit, page)
 * @param options - React Query options
 * @returns Query result with paginated users data
 */
export const useGetRoleUsers = (
    params?: RoleUsersParams,
    options?: Omit<
        UseQueryOptions<
            RoleUsersResponse,
            ApiErrorResponse,
            RoleUsersResponse,
            readonly unknown[]
        >,
        'queryKey' | 'queryFn'
    >,
) => {
    const { limit = 10, page = 1, search = "" } = params || {};
    const queryKey = ['get-role-users', limit, page, search] as const;

    return useQuery<RoleUsersResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const res = await Axios.get<RoleUsersResponse>('/roles/users', {
                params: { limit, page, search },
            });
            return res.data;
        },
        retry: false,
        ...options,
    });
};

/**
 * Hook to create a new role
 * @param options - React Query mutation options
 * @returns Mutation result for creating a role
 */
export const useCreateRole = (
    options?: UseMutationOptions<
        CreateRoleResponse,
        ApiErrorResponse,
        CreateRolePayload
    >,
) => {
    return useMutation<CreateRoleResponse, ApiErrorResponse, CreateRolePayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.post<CreateRoleResponse>('/roles', payload);
            return data;
        },
        ...options,
    });
};

/**
 * Hook to fetch all roles with pagination and filters
 * @param options - React Query options
 * @returns Query result with roles data and pagination
 */
export const useGetRoles = (
    options?: Omit<
        UseQueryOptions<GetRolesResponse, ApiErrorResponse, GetRolesResponse, readonly unknown[]>,
        'queryKey' | 'queryFn'
    >,
) => {
    const { getParam } = useQueryParams();

    const page = getParam('page') || '1';
    const limit = getParam('limit') || '10';
    const search = getParam('search') || undefined;
    const status = getParam('status') || undefined;

    // Convert status to activeStatus boolean
    let activeStatus: string | undefined = undefined;
    if (status === 'active') {
        activeStatus = 'true';
    } else if (status === 'inactive') {
        activeStatus = 'false';
    }

    const params = {
        page,
        limit,
        search,
        activeStatus,
    };

    const queryKey = ['get-roles', params] as const;

    return useQuery<GetRolesResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const query = new URLSearchParams();
            query.append('page', page);
            query.append('limit', limit);
            if (activeStatus) query.append('activeStatus', activeStatus);
            if (search) query.append('search', search);

            const apiUrl = `/roles?${query.toString()}`;
            const res = await Axios.get<GetRolesResponse>(apiUrl);
            return res.data;
        },
        retry: false,
        ...options,
    });
};

/**
 * Hook to toggle role status (activate/deactivate)
 * @param options - React Query mutation options
 * @returns Mutation result for toggling role status
 */
export const useToggleRoleStatus = (
    options?: UseMutationOptions<
        ToggleRoleStatusResponse,
        ApiErrorResponse,
        ToggleRoleStatusPayload
    >,
) => {
    return useMutation<
        ToggleRoleStatusResponse,
        ApiErrorResponse,
        ToggleRoleStatusPayload
    >({
        mutationFn: async (payload) => {
            const { data } = await Axios.patch<ToggleRoleStatusResponse>(
                `/roles/${payload.roleId}/status`,
            );
            return data;
        },
        ...options,
    });
};

/**
 * Hook to delete a role
 * @param options - React Query mutation options
 * @returns Mutation result for deleting a role
 */
export const useDeleteRole = (
    options?: UseMutationOptions<
        DeleteRoleResponse,
        ApiErrorResponse,
        DeleteRolePayload
    >,
) => {
    return useMutation<DeleteRoleResponse, ApiErrorResponse, DeleteRolePayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.delete<DeleteRoleResponse>(
                `/roles/${payload.roleId}`,
            );
            return data;
        },
        ...options,
    });
};

/**
 * Hook to assign a role to a user
 * @param options - React Query mutation options
 * @returns Mutation result for assigning a role to a user
 */
export const useAssignRoleToUser = (
    options?: UseMutationOptions<
        AssignRoleToUserResponse,
        ApiErrorResponse,
        AssignRoleToUserPayload
    >,
) => {
    return useMutation<
        AssignRoleToUserResponse,
        ApiErrorResponse,
        AssignRoleToUserPayload
    >({
        mutationFn: async (payload) => {
            const { data } = await Axios.post<AssignRoleToUserResponse>(
                '/roles/assign',
                payload,
            );
            return data;
        },
        ...options,
    });
};

/**
 * Hook to update a role
 * @param options - React Query mutation options
 * @returns Mutation result for updating a role
 */
export const useUpdateRole = (
    options?: UseMutationOptions<
        UpdateRoleResponse,
        ApiErrorResponse,
        UpdateRolePayload
    >,
) => {
    return useMutation<UpdateRoleResponse, ApiErrorResponse, UpdateRolePayload>({
        mutationFn: async (payload) => {
            const { roleId, ...body } = payload;
            const { data } = await Axios.patch<UpdateRoleResponse>(
                `/roles/${roleId}`,
                body,
            );
            return data;
        },
        ...options,
    });
};

/**
 * Hook to fetch a role by its ID
 * @param roleId - The ID of the role to fetch
 * @param options - React Query options
 * @returns Query result with the role data
 */
export const useGetRoleById = (
    roleId: string,
    options?: Omit<
        UseQueryOptions<
            GetRoleByIdResponse,
            ApiErrorResponse,
            GetRoleByIdResponse,
            readonly unknown[]
        >,
        'queryKey' | 'queryFn'
    >,
) => {
    const queryKey = ['get-role-by-id', roleId] as const;

    return useQuery<GetRoleByIdResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const res = await Axios.get<GetRoleByIdResponse>(`/roles/${roleId}`);
            return res.data;
        },
        enabled: !!roleId, // Only run the query if roleId is available
        ...options,
    });
};


export const useGetAllRoleForInvite = (
    options?: Omit<
        UseQueryOptions<
            GetAllRoleForInviteResponse,
            ApiErrorResponse,
            GetAllRoleForInviteResponse,
            readonly unknown[]
        >,
        'queryKey' | 'queryFn'
    >,
) => {
    const queryKey = ['get-all-roles-for-invite'];
    return useQuery<GetAllRoleForInviteResponse, ApiErrorResponse>({
        queryKey,
        queryFn: async () => {
            const res = await Axios.get<GetAllRoleForInviteResponse>('/roles/invite/roles?activeStatus=true');
            return res.data;
        },
        retry: false,
        ...options,
    });
};

export const useInviteUser = (
    options?: UseMutationOptions<
        InviteUserResponse,
        ApiErrorResponse,
        InviteUserPayload
    >,
) => {
    return useMutation<InviteUserResponse, ApiErrorResponse, InviteUserPayload>({
        mutationFn: async (payload) => {
            const { data } = await Axios.post<InviteUserResponse>(
                '/roles/assign-and-invite',
                payload,
            );
            return data;
        },
        ...options,
    });
};


