import { useTranslations } from 'next-intl';
import * as Yup from 'yup';

const IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf',
];

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const PHONE_MAX_DIGITS = 15;

const getPhoneDigitCount = (value: unknown) => {
    return String(value ?? '').replace(/\D/g, '').length;
};



export const RiderFormStep1Schema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must not exceed 50 characters')
        .required('Name is required'),

    email: Yup.string()
        .trim()
        .email('Please enter a valid email address')
        .required('Email is required'),

    phone: Yup.string()
        .matches(
            /^[0-9+\-\s()]{7,20}$/,
            'Please enter a valid phone number',
        )
        .test(
            'phoneMaxDigits',
            'Please enter a valid phone number',
            (value) => getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
        )
        .required('Phone number is required'),

    zone_id: Yup.string()
        .required('City / Zone is required'),

    send_login_credentials_email: Yup.boolean(),


    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
        .required('Password is required'),

    confirm_password: Yup.string()
        .required('Confirm password is required'),
});

export const RiderFormStep2Schema = () => {
    const documentFile = Yup.mixed<File>()
        .required('File is required')
        .test(
            'fileType',
            'Only PNG / JPG / WebP / PDF allowed',
            (file) => !!file && IMAGE_TYPES.includes(file.type),
        )
        .test(
            'fileSize',
            'Max 5MB allowed',
            (file) => !!file && file.size <= MAX_BYTES,
        );

    const optionalDocumentFile = Yup.mixed<File>()
        .nullable()
        .test(
            'fileType',
            'Only PNG / JPG / WebP / PDF allowed',
            (file) => !file || IMAGE_TYPES.includes(file.type),
        )
        .test(
            'fileSize',
            'Max 5MB allowed',
            (file) => !file || file.size <= MAX_BYTES,
        );



    return Yup.object().shape({
        profile_picture: documentFile,

        driver_license_front: documentFile,
        driver_license_back: documentFile,

        national_id_front: documentFile,
        national_id_back: documentFile,

        vehicle_registration_front: documentFile,
        vehicle_registration_back: documentFile,

        company_commercial_registration: optionalDocumentFile,

    });
};



export const RiderFormStep3Schema = () =>
    Yup.object().shape({
        vehicle_type: Yup.string()
            .required('Vehicle type is required'),

        vehicle_brand: Yup.string()
            .trim()
            .min(2, 'Vehicle brand must be at least 2 characters')
            .max(50, 'Vehicle brand must not exceed 50 characters')
            .required('Vehicle brand is required'),

        model_year_limit: Yup.number()
            .typeError('Model year must be a number')
            .min(2000, 'Model year must be 2000 or later')
            .max(
                new Date().getFullYear() + 1,
                'Model year cannot be in the future',
            )
            .required('Model year is required'),

        vehicle_color: Yup.string()
            .trim()
            .min(2, 'Vehicle color must be at least 2 characters')
            .max(30, 'Vehicle color must not exceed 30 characters')
            .required('Vehicle color is required'),

        vehicle_number: Yup.string()
            .trim()
            .min(3, 'Vehicle number must be at least 3 characters')
            .max(20, 'Vehicle number must not exceed 20 characters')
            .required('Vehicle number is required'),

        vehicle_in_good_condition: Yup.boolean()
            .oneOf([true], 'Vehicle must be in good condition')
            .required(),

        insulated_delivery_bag: Yup.boolean().oneOf([true], 'Must have insulated delivery bag')
            .required(),


    });

export const RiderFormStep4Schema = () =>
    Yup.object().shape({
        cod_limit_enabled: Yup.boolean().required(),
        cod_limit_amount: Yup.number()
            .nullable()
            .transform((value, originalValue) =>
                originalValue === '' || originalValue === null ? null : value,
            )
            .when('cod_limit_enabled', {
                is: true,
                then: (schema) =>
                    schema
                        .min(1)
                        .required(),
                otherwise: (schema) => schema.notRequired(),
            }),
        cod_warning_threshold: Yup.string().when('cod_limit_enabled', {
            is: true,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
        cod_auto_settlement_cycle: Yup.string().when('cod_limit_enabled', {
            is: true,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
        cod_allow_online_payments_when_blocked: Yup.boolean().required(),
    });

export const EditRiderFormSchema = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    t: ReturnType<typeof useTranslations>) =>
    Yup.object().shape({
        name: Yup.string()
            .trim()
            .min(3, "Name must be at least 3 characters")
            .max(50, "Name must not exceed 50 characters")
            .required("Name is required"),

        email: Yup.string()
            .trim()
            .email("Please enter a valid email address")
            .required("Email is required"),

        phone: Yup.string()
            .matches(/^[0-9+\-\s()]{7,20}$/, "Please enter a valid phone number")
            .test(
                'phoneMaxDigits',
                'Please enter a valid phone number',
                (value) => getPhoneDigitCount(value) <= PHONE_MAX_DIGITS,
            )
            .required("Phone number is required"),

        zone_id: Yup.string()
            .required("Zone/City is required"),

        password: Yup.string()
            .trim()
            .notRequired()
            .test(
                'passwordStrength',
                'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
                (value) =>
                    !value ||
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/.test(
                        value,
                    ),
            ),
        confirm_password: Yup.string().when('password', {
            is: (password: string | undefined) => Boolean(password),
            then: (schema) =>
                schema
                    .required('Confirm password is required')
                    .oneOf([Yup.ref('password')], 'Passwords must match'),
            otherwise: (schema) => schema.notRequired(),
        }),

        vehicle_type: Yup.string().required("Vehicle type is required"),

        vehicle_brand: Yup.string().required("Vehicle brand is required"),
        model_year_limit: Yup.number()
            .typeError("Model year must be a number")
            .min(1900, "Year must be valid")
            .max(new Date().getFullYear(), "Year cannot be in the future")
            .required("Model year is required"),
        vehicle_color: Yup.string().required("Vehicle color is required"),
        vehicle_number: Yup.string().required("Vehicle number is required"),
        vehicle_in_good_condition: Yup.boolean()
            .oneOf([true], "Vehicle must be in good condition")
            .required("Vehicle condition is required"),
        insulated_delivery_bag: Yup.boolean().required(),
        cod_limit_enabled: Yup.boolean().required(),
        cod_limit_amount: Yup.number()
            .nullable()
            .transform((value, originalValue) =>
                originalValue === '' || originalValue === null ? null : value,
            )
            .when('cod_limit_enabled', {
                is: true,
                then: (schema) =>
                    schema
                        .min(1)
                        .required(),
                otherwise: (schema) => schema.notRequired(),
            }),
        cod_warning_threshold: Yup.string().when('cod_limit_enabled', {
            is: true,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
        cod_auto_settlement_cycle: Yup.string().when('cod_limit_enabled', {
            is: true,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
        cod_allow_online_payments_when_blocked: Yup.boolean().required(),

        profile_picture: Yup.mixed<File>()
            .nullable()
            .test(
                "fileType",
                "Only PNG/JPG/WebP allowed",
                (file) => !file || IMAGE_TYPES.includes(file.type)
            )
            .test(
                "fileSize",
                "Max 5MB allowed",
                (file) => !file || file.size <= MAX_BYTES
            ),

        driver_license_front: Yup.mixed<File>()
            .nullable()
            .test(
                "fileType",
                "Only PNG/JPG/WebP allowed",
                (file) => !file || IMAGE_TYPES.includes(file.type)
            )
            .test(
                "fileSize",
                "Max 5MB allowed",
                (file) => !file || file.size <= MAX_BYTES
            ),

        driver_license_back: Yup.mixed<File>()
            .nullable()
            .test(
                "fileType",
                "Only PNG/JPG/WebP allowed",
                (file) => !file || IMAGE_TYPES.includes(file.type)
            )
            .test(
                "fileSize",
                "Max 5MB allowed",
                (file) => !file || file.size <= MAX_BYTES
            ),

        national_id_front: Yup.mixed<File>()
            .nullable()
            .test(
                "fileType",
                "Only PNG/JPG/WebP allowed",
                (file) => !file || IMAGE_TYPES.includes(file.type)
            )
            .test(
                "fileSize",
                "Max 5MB allowed",
                (file) => !file || file.size <= MAX_BYTES
            ),

        national_id_back: Yup.mixed<File>()
            .nullable()
            .test(
                "fileType",
                "Only PNG/JPG/WebP allowed",
                (file) => !file || IMAGE_TYPES.includes(file.type)
            )
            .test(
                "fileSize",
                "Max 5MB allowed",
                (file) => !file || file.size <= MAX_BYTES
            ),

        vehicle_registration_front: Yup.mixed<File>()
            .nullable()
            .test(
                "fileType",
                "Only PNG/JPG/WebP allowed",
                (file) => !file || IMAGE_TYPES.includes(file.type)
            )
            .test(
                "fileSize",
                "Max 5MB allowed",
                (file) => !file || file.size <= MAX_BYTES
            ),

        vehicle_registration_back: Yup.mixed<File>()
            .nullable()
            .test(
                "fileType",
                "Only PNG/JPG/WebP allowed",
                (file) => !file || IMAGE_TYPES.includes(file.type)
            )
            .test(
                "fileSize",
                "Max 5MB allowed",
                (file) => !file || file.size <= MAX_BYTES
            ),

        company_commercial_registration: Yup.mixed<File>()
            .nullable()
            .test(
                "fileType",
                "Only PNG/JPG/WebP allowed",
                (file) => !file || IMAGE_TYPES.includes(file.type)
            )
            .test(
                "fileSize",
                "Max 5MB allowed",
                (file) => !file || file.size <= MAX_BYTES
            ),
    });

export interface EditRiderFormValues {
    name: string;
    email: string;
    phone: string;
    zone_id: string; // city / zone
    city?: string;
    vehicle_type: string;
    vehicle_brand: string;
    model_year_limit: number | string | null;
    vehicle_color: string;
    vehicle_number: string;
    vehicle_in_good_condition: boolean;
    insulated_delivery_bag: boolean;
    is_four_wheeler?: boolean;
    air_conditioning?: boolean;
    no_cosmetic_damage?: boolean;
    availabilityStatus?: string;
    status?: string;
    is_approved?: boolean;
    is_onboarding_completed?: boolean;
    licenseNumber?: string;
    helmet?: boolean;
    password?: string;
    confirm_password?: string;
    profile_picture: File | null;
    driver_license_front: File | null;
    driver_license_back: File | null;
    national_id_front: File | null;
    national_id_back: File | null;
    vehicle_registration_front: File | null;
    vehicle_registration_back: File | null;
    company_commercial_registration: File | null;
    cod_limit_enabled: boolean;
    cod_limit_amount: number | string | null;
    cod_warning_threshold: string;
    cod_auto_settlement_cycle: string;
    cod_allow_online_payments_when_blocked: boolean;

}
