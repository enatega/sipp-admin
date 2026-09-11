import * as Yup from 'yup';

export const validationSchema = (t: (key: string) => string) => {

    const max_size = 1024 * 1024 * 5;

    return Yup.object().shape({
        approved_amount: Yup.number()
            .min(1, t('amountMinError'))
            .required(t('amountRequiredError')),
        payment_proof: Yup.mixed()
            .required(t('proofRequiredError'))
            .test(
                'fileSize',
                t('proofMaxSizeError'),
                (value): boolean => {
                    if (!value) return false;
                    if (!(value instanceof File)) return false;

                    return value.size <= max_size;
                }
            ),

        notes: Yup.string()
            .optional(),
    });
};