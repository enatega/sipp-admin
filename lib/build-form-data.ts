interface FormDataOptions {
  /**
   * Array keys ko kaise handle karna hai
   * 'brackets' => field[] format (default)
   * 'indices' => field[0], field[1] format
   * 'repeat' => field, field, field format
   */
  arrayFormat?: 'brackets' | 'indices' | 'repeat';
  
  /**
   * Nested objects ko kaise handle karna hai
   * 'dots' => user.name format (default)
   * 'brackets' => user[name] format
   * 'stringify' => JSON.stringify karo
   */
  nestedFormat?: 'dots' | 'brackets' | 'stringify';
  
  /**
   * null/undefined values ko skip karna hai?
   */
  skipNullish?: boolean;
  
  /**
   * Empty strings ko skip karna hai?
   */
  skipEmpty?: boolean;
}

/**
 * Generic function jo kisi bhi payload ko FormData mein convert karta hai
 * @param payload - Any object/data to convert
 * @param options - Configuration options
 * @returns FormData object
 */
function buildFormData<T extends Record<string, unknown>>(
  payload: T,
  options: FormDataOptions = {}
): FormData {
  const {
    arrayFormat = 'brackets',
    nestedFormat = 'dots',
    skipNullish = true,
    skipEmpty = false,
  } = options;

  const fd = new FormData();

  /**
   * Recursive function jo nested objects/arrays ko handle karta hai
   */
  function appendValue(
    key: string,
    value: unknown,
    isNested: boolean = false
  ): void {
    // null/undefined check
    if (value === null || value === undefined) {
      if (skipNullish) return;
      fd.append(key, '');
      return;
    }

    // empty string check
    if (skipEmpty && value === '') {
      return;
    }

    // Handle primitives (string, number, boolean)
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      fd.append(key, String(value));
      return;
    }

    // Handle File/Blob
    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value);
      return;
    }

    // Handle Date
    if (value instanceof Date) {
      fd.append(key, value.toISOString());
      return;
    }

    // Handle Arrays
    if (Array.isArray(value)) {
      if (value.length === 0 && !skipEmpty) {
        fd.append(key, JSON.stringify([]));
        return;
      }

      value.forEach((item, index) => {
        let arrayKey: string;
        
        switch (arrayFormat) {
          case 'indices':
            arrayKey = `${key}[${index}]`;
            break;
          case 'repeat':
            arrayKey = key;
            break;
          case 'brackets':
          default:
            arrayKey = `${key}[]`;
            break;
        }

        appendValue(arrayKey, item, true);
      });
      return;
    }


    if (typeof value === 'object' && value !== null) {
      if (isNested && nestedFormat === 'stringify') {
        try {
          fd.append(key, JSON.stringify(value));
        } catch (error) {
          console.error(`Failed to stringify key "${key}":`, error);
          fd.append(key, String(value));
        }
        return;
      }

      // Nested object ke properties ko iterate karo
      const entries = Object.entries(value);
      
      if (entries.length === 0 && !skipEmpty) {
        fd.append(key, JSON.stringify({}));
        return;
      }

      entries.forEach(([nestedKey, nestedValue]) => {
        let fullKey: string;

        switch (nestedFormat) {
          case 'brackets':
            fullKey = `${key}[${nestedKey}]`;
            break;
          case 'stringify':
            try {
              fd.append(key, JSON.stringify(value));
            } catch (error) {
              console.error(`Failed to stringify key "${key}":`, error);
              fd.append(key, String(value));
            }
            return;
          case 'dots':
          default:
            fullKey = `${key}.${nestedKey}`;
            break;
        }

        appendValue(fullKey, nestedValue, true);
      });
      return;
    }


    try {
      fd.append(key, JSON.stringify(value));
    } catch (err) {
      console.error(err)
      fd.append(key, String(value));
    }
  }


  Object.entries(payload).forEach(([key, value]) => {
    appendValue(key, value);
  });

  return fd;
}

// Type-safe helper functions
export function buildFormDataSimple<T extends Record<string, unknown>>(
  payload: T
): FormData {
  return buildFormData(payload);
}

export function buildFormDataWithFiles<T extends Record<string, unknown>>(
  payload: T
): FormData {
  return buildFormData(payload, {
    skipNullish: true,
    skipEmpty: false,
  });
}

export default buildFormData;





/* Example 1: Simple payload
const simplePayload = {
  name: 'Ahmed',
  age: 25,
  isActive: true,
  profile: null, // skip ho jayega
};

const fd1 = buildFormData(simplePayload);

// Example 2: Nested objects with different formats
const nestedPayload = {
  user: {
    name: 'Ali',
    email: 'ali@example.com',
    address: {
      city: 'Karachi',
      country: 'Pakistan',
    },
  },
};

// Dots format: user.name, user.email, user.address.city
const fd2 = buildFormData(nestedPayload, { nestedFormat: 'dots' });

// Brackets format: user[name], user[email], user[address][city]
const fd3 = buildFormData(nestedPayload, { nestedFormat: 'brackets' });

// Stringify format: user = {"name":"Ali",...}
const fd4 = buildFormData(nestedPayload, { nestedFormat: 'stringify' });

// Example 3: Arrays
const arrayPayload = {
  tags: ['javascript', 'typescript', 'react'],
  files: [new File(['content'], 'file1.txt'), new File(['content'], 'file2.txt')],
};

// Brackets: tags[], tags[], tags[]
const fd5 = buildFormData(arrayPayload, { arrayFormat: 'brackets' });

// Indices: tags[0], tags[1], tags[2]
const fd6 = buildFormData(arrayPayload, { arrayFormat: 'indices' });

// Repeat: tags, tags, tags
const fd7 = buildFormData(arrayPayload, { arrayFormat: 'repeat' });

// Example 4: Complex payload with files
const complexPayload = {
  driver: {
    name: 'Hassan',
    license: 'ABC123',
    documents: {
      cnic: new File(['cnic'], 'cnic.jpg'),
      license: new File(['license'], 'license.pdf'),
    },
  },
  vehicle: {
    model: 'Honda City',
    year: 2023,
    images: [
      new File(['img1'], 'car1.jpg'),
      new File(['img2'], 'car2.jpg'),
    ],
  },
  metadata: {
    timestamp: new Date(),
    tags: ['new', 'verified'],
  },
};

const fd8 = buildFormData(complexPayload, {
  nestedFormat: 'dots',
  arrayFormat: 'brackets',
  skipNullish: true,
  skipEmpty: true,
});

// Example 5: Your original use case
interface CreateDriverPayload {
  name: string;
  email: string;
  phone?: string;
  avatar?: File;
  documents?: File[];
  metadata?: Record<string, any>;
}

const driverPayload: CreateDriverPayload = {
  name: 'Imran',
  email: 'imran@example.com',
  phone: '+92300123456',
  avatar: new File(['avatar'], 'avatar.jpg'),
  documents: [
    new File(['doc1'], 'license.pdf'),
    new File(['doc2'], 'cnic.jpg'),
  ],
  metadata: {
    verified: true,
    rating: 4.5,
  },
};

const fd9 = buildFormData(driverPayload); 
*/