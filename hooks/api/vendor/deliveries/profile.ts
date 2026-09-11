import Axios from "@/config/axios";
import { ApiErrorResponse, GetVendorProfileParams, GetVendorProfileResponse, UpdateVendorProfilePayload, UpdateVendorProfileResponse } from "@/types";
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const useVendorProfile = (options?: Omit<UseQueryOptions<GetVendorProfileResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>) => {

    const { vendorId } = useParams() as { vendorId: string }

    const params: GetVendorProfileParams = {
        vendorId
    }

    return useQuery<GetVendorProfileResponse, ApiErrorResponse>({

        queryKey: ['vendor-profile', params],
        queryFn: async () => {

            const response = await Axios.get<GetVendorProfileResponse>(`/apps/deliveries/admin/vendor-profile/${vendorId}`)
            return response.data
        },
        ...options
    })

}


export const useUpdateVendorProfile = (options?: UseMutationOptions<UpdateVendorProfileResponse, ApiErrorResponse, UpdateVendorProfilePayload>) => {

    const queryClient = useQueryClient()

    return useMutation<UpdateVendorProfileResponse, ApiErrorResponse, UpdateVendorProfilePayload>({
        mutationFn: async (payload: UpdateVendorProfilePayload) => {
            const formData = new FormData()
            formData.append('vendorId', payload.vendorId)

            if (payload.name != null) formData.append('name', payload.name)
            if (payload.email != null) formData.append('email', payload.email)
            if (payload.password != null) formData.append('password', payload.password)
            if (payload.city != null) formData.append('city', payload.city)
            if (payload.phone != null) formData.append('phone', payload.phone)
            if (payload.bank_name != null) formData.append('bank_name', payload.bank_name)
            if (payload.account_title != null) formData.append('account_title', payload.account_title)
            if (payload.branch_code != null) formData.append('branch_code', payload.branch_code)
            if (payload.iban_account_no != null) formData.append('iban_account_no', payload.iban_account_no)
            if (payload.notes != null) formData.append('notes', payload.notes)
            if (payload.business_liscence_front_file) formData.append('business_liscence_front_file', payload.business_liscence_front_file)
            if (payload.business_liscence_back_file) formData.append('business_liscence_back_file', payload.business_liscence_back_file)
            if (payload.national_id_front_file) formData.append('national_id_front_file', payload.national_id_front_file)
            if (payload.national_id_back_file) formData.append('national_id_back_file', payload.national_id_back_file)

            const { data } = await Axios.patch<UpdateVendorProfileResponse>(`/apps/deliveries/admin/vendor-profile/${payload.vendorId}`, formData)
            return data

        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['vendor-profile'],
                exact: false,
                refetchType: 'all'
            })
        },
        ...options

    })

}