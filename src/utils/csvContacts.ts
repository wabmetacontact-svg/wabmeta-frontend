// src/utils/csvContacts.ts - FINAL COMPLETE
import Papa from 'papaparse';

// ============================================
// TYPES
// ============================================

export type ParsedContact = {
  phone: string;
  countryCode: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  tags?: string[];
  customFields?: Record<string, any>;
};

export type ParseResult = {
  contacts: ParsedContact[];
  errors: ParseError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
};

export type ParseError = {
  row: number;
  phone: string;
  error: string;
};

// ============================================
// PHONE NORMALIZE
// ============================================

export const toCanonicalPhone = (input: string): string | null => {
  if (!input) return null;

  const cleaned = String(input)
    .replace(/[\s\-\(\)\.]/g, '')
    .trim();

  if (!cleaned) return null;

  const digits = cleaned.replace(/\D/g, '');
  if (!digits || digits.length < 7) return null;

  if (cleaned.startsWith('+')) {
    if (digits.length < 7 || digits.length > 15) return null;

    if (digits.startsWith('9191') && digits.length === 14) {
      const nat = digits.slice(4);
      if (/^[6-9]\d{9}$/.test(nat)) return `+91${nat}`;
    }

    if (digits.startsWith('91') && digits.length === 12) {
      const nat = digits.slice(2);
      if (!/^[6-9]\d{9}$/.test(nat)) return null;
    }

    return `+${digits}`;
  }

  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    const nat = digits.slice(1);
    if (/^[6-9]\d{9}$/.test(nat)) return `+91${nat}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    const nat = digits.slice(2);
    if (/^[6-9]\d{9}$/.test(nat)) return `+91${nat}`;
  }

  if (digits.length === 14 && digits.startsWith('9191')) {
    const nat = digits.slice(4);
    if (/^[6-9]\d{9}$/.test(nat)) return `+91${nat}`;
  }

  if (digits.length >= 7 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
};

export const extractCountryCode = (canonical: string): string => {
  if (!canonical?.startsWith('+')) return '+91';

  const digits = canonical.slice(1);

  const cc3 = ['971', '966', '974', '973', '968', '880', '977', '852', '855'];
  for (const cc of cc3) {
    if (digits.startsWith(cc)) return `+${cc}`;
  }

  const cc2 = [
    '91', '44', '61', '49', '33', '86', '81', '82', '55',
    '52', '39', '34', '31', '46', '47', '45', '41', '43',
    '48', '90', '92', '93', '94', '95', '98', '60', '65',
    '66', '63', '62', '64', '20', '27', '30', '36', '40',
  ];
  for (const cc of cc2) {
    if (digits.startsWith(cc)) return `+${cc}`;
  }

  return '+1';
};

// ============================================
// ✅ FORMAT PHONE FOR DISPLAY
// ============================================

export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';

  const canonical = toCanonicalPhone(String(phone).trim());
  if (canonical) return canonical;

  // Fallback
  const clean = String(phone).replace(/[\s\-\(\)]/g, '');
  if (/^\d{10}$/.test(clean)) return `+91${clean}`;
  if (/^91\d{10}$/.test(clean)) return `+${clean}`;

  return phone;
};

// ============================================
// VALIDATION
// ============================================

export const validatePhone = (phone: string): boolean => {
  return toCanonicalPhone(phone) !== null;
};

export const validateIndianPhone = (phone: string): boolean => {
  if (!phone) return false;
  const clean = String(phone).replace(/[\s\-\(\)]/g, '');
  return (
    /^\+91[6-9]\d{9}$/.test(clean) ||
    /^91[6-9]\d{9}$/.test(clean) ||
    /^[6-9]\d{9}$/.test(clean)
  );
};

export const validateInternationalPhone = (phone: string): boolean => {
  return toCanonicalPhone(phone) !== null;
};

export const validatePhoneInput = (
  phone: string
): { valid: boolean; message: string; normalized?: string } => {
  if (!phone?.trim()) {
    return { valid: false, message: 'Phone number is required' };
  }

  const canonical = toCanonicalPhone(phone);

  if (!canonical) {
    return {
      valid: false,
      message: 'Invalid phone number. Include country code (e.g., +91XXXXXXXXXX, +1XXXXXXXXXX)',
    };
  }

  return {
    valid: true,
    message: 'Valid phone number',
    normalized: canonical,
  };
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// ============================================
// NORMALIZE
// ============================================

export function normalizePhone(
  raw: string,
  _defaultCountryCode = '+91'
): { phone: string; countryCode: string } {
  const canonical = toCanonicalPhone(raw);

  if (!canonical) {
    return { phone: '', countryCode: '+91' };
  }

  return {
    phone: canonical,
    countryCode: extractCountryCode(canonical),
  };
}

// ============================================
// NAME PARSING
// ============================================

export function splitName(fullName: string): {
  firstName: string | null;
  lastName: string | null;
} {
  const name = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!name) return { firstName: null, lastName: null };

  const parts = name.split(' ');
  return {
    firstName: parts[0] || null,
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
  };
}

// ============================================
// TAGS PARSING
// ============================================

export function parseTags(tagValue: string | undefined): string[] {
  if (!tagValue) return [];
  return Array.from(
    new Set(
      tagValue
        .split(/[|,;]/)
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
}

// ============================================
// CSV PARSING
// ============================================

export async function parseCsvFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  return parseCsvText(text);
}

export function parseCsvText(text: string): ParseResult {
  const cleanText = text.replace(/^\uFEFF/, '');

  const result = Papa.parse<any>(cleanText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.replace(/^\uFEFF/, '').trim(),
  });

  const errors: ParseError[] = [];
  const contacts: ParsedContact[] = [];

  if (!result.data?.length) {
    return {
      contacts: [],
      errors: [{ row: 0, phone: '', error: 'CSV is empty or headers missing' }],
      summary: { total: 0, valid: 0, invalid: 0 },
    };
  }

  const rows = result.data;

  rows.forEach((row: any, idx: number) => {
    const rowNum = idx + 2;

    const getVal = (keys: string[]): string => {
      for (const key of keys) {
        for (const rk of Object.keys(row)) {
          if (rk.trim().toLowerCase() === key.toLowerCase()) {
            const v = row[rk];
            if (v !== undefined && v !== null && String(v).trim()) {
              return String(v).trim();
            }
          }
        }
      }
      return '';
    };

    const phoneRaw = getVal([
      'phone', 'mobile', 'number', 'phone_number',
      'phonenumber', 'phone number', 'contact', 'whatsapp', 'mob',
    ]);

    const nameRaw = getVal([
      'name', 'firstname', 'first_name', 'first name',
      'full name', 'fullname', 'contact name',
    ]);

    const lastNameRaw = getVal([
      'lastname', 'last_name', 'last name', 'surname',
    ]);

    const emailRaw = getVal(['email', 'mail', 'email_address']);
    const tagRaw = getVal(['tag', 'tags', 'labels', 'label']);

    if (!phoneRaw) {
      errors.push({ row: rowNum, phone: '', error: 'Phone number is required' });
      return;
    }

    const canonical = toCanonicalPhone(phoneRaw);
    if (!canonical) {
      errors.push({
        row: rowNum,
        phone: phoneRaw,
        error: `Invalid phone: "${phoneRaw}". Use format: +91XXXXXXXXXX, +1XXXXXXXXXX etc.`,
      });
      return;
    }

    const emailTrim = emailRaw.trim();
    if (emailTrim && !validateEmail(emailTrim)) {
      errors.push({ row: rowNum, phone: phoneRaw, error: 'Invalid email format' });
      return;
    }

    const { firstName: fn, lastName: ln } = splitName(nameRaw);
    const firstName = fn;
    const lastName = lastNameRaw || ln;

    const standardKeys = [
      'name', 'phone', 'mobile', 'number', 'email',
      'tag', 'tags', 'firstname', 'lastname',
      'first_name', 'last_name',
    ];

    const customFields: Record<string, any> = {};
    Object.keys(row).forEach((key) => {
      if (!standardKeys.includes(key.toLowerCase())) {
        customFields[key] = row[key];
      }
    });

    contacts.push({
      phone: canonical,
      countryCode: extractCountryCode(canonical),
      firstName,
      lastName,
      email: emailTrim || null,
      tags: parseTags(tagRaw),
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
    });
  });

  return {
    contacts,
    errors,
    summary: {
      total: rows.length,
      valid: contacts.length,
      invalid: errors.length,
    },
  };
}

// ============================================
// SAMPLE CSV
// ============================================

export function generateSampleCsv(): string {
  return `Name,Phone,Email,Tags
Rahul Kumar,+919876543210,rahul@example.com,customer
John Smith,+14155551234,john@example.com,lead
James Wilson,+447911123456,james@example.com,vip
Ahmed Ali,+971501234567,ahmed@example.com,international
Priya Sharma,9876543211,priya@example.com,customer`;
}

export function downloadSampleCsv(): void {
  const blob = new Blob([generateSampleCsv()], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contacts_sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// BATCH VALIDATION
// ============================================

export function validatePhoneBatch(phones: string[]): {
  valid: string[];
  invalid: Array<{ phone: string; error: string }>;
} {
  const valid: string[] = [];
  const invalid: Array<{ phone: string; error: string }> = [];

  phones.forEach((phone) => {
    const r = validatePhoneInput(phone);
    if (r.valid && r.normalized) {
      valid.push(r.normalized);
    } else {
      invalid.push({ phone, error: r.message });
    }
  });

  return { valid, invalid };
}

// ============================================
// DUPLICATE DETECTION
// ============================================

export function findDuplicates(contacts: ParsedContact[]): {
  duplicates: Map<string, number>;
  unique: ParsedContact[];
} {
  const seen = new Map<string, number>();
  const unique: ParsedContact[] = [];

  contacts.forEach((contact) => {
    const count = seen.get(contact.phone) || 0;
    seen.set(contact.phone, count + 1);
    if (count === 0) unique.push(contact);
  });

  const duplicates = new Map(
    Array.from(seen.entries()).filter(([, count]) => count > 1)
  );

  return { duplicates, unique };
}

// ============================================
// CSV EXPORT
// ============================================

export function contactsToCsv(contacts: ParsedContact[]): string {
  const headers = ['Name', 'Phone', 'Email', 'Tags'];
  const rows = contacts.map((c) => [
    [c.firstName, c.lastName].filter(Boolean).join(' '),
    c.phone,
    c.email || '',
    c.tags?.join('|') || '',
  ]);

  return Papa.unparse({ fields: headers, data: rows });
}

export function downloadContactsCsv(
  contacts: ParsedContact[],
  filename = 'contacts.csv'
): void {
  const blob = new Blob([contactsToCsv(contacts)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Validation
  validateIndianPhone,
  validateInternationalPhone,
  validatePhone,
  validatePhoneInput,
  validateEmail,
  validatePhoneBatch,

  // Normalization
  normalizePhone,
  toCanonicalPhone,
  extractCountryCode,
  formatPhoneForDisplay,  // ✅ ADDED

  // Parsing
  parseCsvFile,
  parseCsvText,
  splitName,
  parseTags,

  // Export
  contactsToCsv,
  downloadContactsCsv,
  generateSampleCsv,
  downloadSampleCsv,

  // Utilities
  findDuplicates,
};