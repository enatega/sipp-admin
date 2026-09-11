const moduleBoundaryConfig = [
  {
    files: [
      'components/shared/documents/**/*.ts',
      'components/shared/documents/**/*.tsx',
      'components/shared/forms/**/*.ts',
      'components/shared/forms/**/*.tsx',
      'shared/**/*.ts',
      'shared/**/*.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/components/super-admin/*',
            '@/hooks/api/super-admin/*',
            '@/types/entities/super-admin/*',
          ],
        },
      ],
    },
  },
  {
    files: [
      'components/vendor/deliveries/stores/edit-store/**/*.ts',
      'components/vendor/deliveries/stores/edit-store/**/*.tsx',
      'components/store/deliveries/store/profile/**/*.ts',
      'components/store/deliveries/store/profile/**/*.tsx',
      'components/store/deliveries/store/location/**/*.ts',
      'components/store/deliveries/store/location/**/*.tsx',
      'components/store/deliveries/subscription-plans/**/*.ts',
      'components/store/deliveries/subscription-plans/**/*.tsx',
      'components/store/general-bookings/business-type/profile/**/*.ts',
      'components/store/general-bookings/business-type/profile/**/*.tsx',
      'components/store/general-bookings/business-type/location/**/*.ts',
      'components/store/general-bookings/business-type/location/**/*.tsx',
      'components/service-center/profile/**/*.ts',
      'components/service-center/profile/**/*.tsx',
      'components/service-center/location/**/*.ts',
      'components/service-center/location/**/*.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@/components/super-admin/*',
            '@/hooks/api/super-admin/*',
          ],
        },
      ],
    },
  },
];

export default moduleBoundaryConfig;
