import * as Yup from 'yup';

export const payoutDetailFormSchema = Yup.object().shape({

    approvedAmount: Yup.number()
        .typeError('Approved Amount must be a number')
        .positive('Approved Amount must be greater than 0')
        .required('Approved Amount is required'),

    paymentMethod: Yup.array()
        .of(Yup.string())
        .min(1, 'Select at least one payment method')
        .required('Payment Method is required'),

    transactionReferenceNo: Yup.string()
        .trim()
        .required('Transaction Reference No is required'),

    uploadProof: Yup.mixed<File>()
        .nullable()
        .required('Upload Proof is required')
        .test(
            'fileSize',
            'File size must be less than 5MB',
            (value) => !value || (value.size <= 5 * 1024 * 1024)
        )
        .test(

            'fileType',
            'Unsupported file format',
            (value) => !value || ['image/jpeg', 'image/png', 'application/pdf'].includes(value.type)
        ),

    notes: Yup.string().nullable()

});
