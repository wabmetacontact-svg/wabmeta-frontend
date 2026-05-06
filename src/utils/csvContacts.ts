// 📁 src/utils/csvContacts.ts - COMPLETE WITH INDIAN VALIDATION

import Papa from 'papaparse';

// ============================================
// TYPES
// ============================================

export type CsvContactRow = {
  Name?: string;
  name?: string;
  Phone?: string;
  phone?: string;
  Email?: string;
  email?: string;
  Tag?: string;
  tag?: string;
  tags?: string;
  [key: string]: any; // Allow custom fields
};

export type ParsedContact = {
  phone: string; // Normalized format: +919876543210
  countryCode: string; // Always +91
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
// PHONE VALIDATION & NORMALIZATION
// ============================================

/**
 * International phone number regex
 * Must start with + and have 7-15 digits
 */
const INTERNATIONAL_PHONE_REGEX = /^\+\d{7,15}$/;

/**
 * Validate if phone number is valid
 */
export function validateIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Adding '+' if it's purely digits and >= 10
  let toTest = cleaned;
  if (!toTest.startsWith('+') && /^\d{10,15}$/.test(toTest)) {
    toTest = '+' + toTest;
  }
  return INTERNATIONAL_PHONE_REGEX.test(toTest);
}

/**
 * Normalize phone number to +91XXXXXXXXXX format
 * @param raw - Raw phone input
 * @param defaultCountryCode - Default country code (always +91 for Indian)
 * @returns Normalized phone and country code
 */
export function normalizePhone(
  raw: string,
  _defaultCountryCode = '+91'
): { phone: string; countryCode: string } {
  const input = (raw || '').trim();

  // 1. Remove spaces, hyphens, parentheses
  let cleaned = input.replace(/[\s\-\(\)]/g, '');
  
  // 2. Extract country code if starts with '+'
  let phone = '';
  let countryCode = '';

  if (cleaned.startsWith('+')) {
    phone = cleaned;
    // We don't need to perfectly parse the country code here since the backend does it.
    // Just pass the full number with '+' to the backend.
    countryCode = '+91'; // Fallback, backend overrides this
  } else if (/^\d{10,15}$/.test(cleaned)) {
    phone = '+' + cleaned;
    countryCode = '+91'; // Fallback, backend overrides this
  }

  // 3. Final validation
  if (INTERNATIONAL_PHONE_REGEX.test(phone)) {
    return {
      phone,
      countryCode,
    };
  }

  return { phone: '', countryCode: '+91' };
}

/**
 * Format phone for display
 * +919876543210 -> +91 98765 43210
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhone(phone).phone;
  if (!normalized) return phone;

  const digits = normalized.substring(3); // Remove +91
  return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
}

/**
 * Validate phone input in real-time
 */
export function validatePhoneInput(phone: string): {
  valid: boolean;
  message: string;
  normalized?: string;
} {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }

  if (!validateIndianPhone(phone)) {
    return {
      valid: false,
      message: 'Invalid phone number format. Must include country code.',
    };
  }

  const { phone: normalized } = normalizePhone(phone);
  return {
    valid: true,
    message: 'Valid phone number',
    normalized,
  };
}

// ============================================
// NAME PARSING
// ============================================

/**
 * Split full name into first and last name
 */
export function splitName(fullName: string): {
  firstName: string | null;
  lastName: string | null;
} {
  const name = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!name) return { firstName: null, lastName: null };

  const parts = name.split(' ');
  const firstName = parts[0] || null;
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;

  return { firstName, lastName };
}

// ============================================
// TAGS PARSING
// ============================================

/**
 * Parse tags from various formats
 * Supports: "vip", "vip|new", "vip,new", "vip;new"
 */
export function parseTags(tagValue: string | undefined): string[] {
  if (!tagValue) return [];

  const tags = tagValue
    .split(/[|,;]/) // Split by pipe, comma, or semicolon
    .map((tag) => tag.trim())
    .filter(Boolean);

  // Remove duplicates
  return Array.from(new Set(tags));
}

// ============================================
// EMAIL VALIDATION
// ============================================

/**
 * Basic email validation
 */
export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// ============================================
// CSV PARSING
// ============================================

/**
 * Parse CSV file and validate contacts
 * @param file - File object
 * @returns Parsed contacts and errors
 */
export async function parseCsvFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  return parseCsvText(text);
}

/**
 * Parse CSV text and validate contacts
 * @param text - CSV text content
 * @returns Parsed contacts and errors
 */
export function parseCsvText(text: string): ParseResult {
  const result = Papa.parse<CsvContactRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const errors: ParseError[] = [];
  const contacts: ParsedContact[] = [];

  // Check for CSV parsing errors
  if (result.errors?.length) {
    result.errors.forEach((error) => {
      errors.push({
        row: error.row ?? 0,
        phone: '',
        error: `CSV parse error: ${error.message}`,
      });
    });
  }

  const rows = result.data || [];

  if (!rows.length) {
    return {
      contacts: [],
      errors: [{ row: 0, phone: '', error: 'CSV is empty or headers missing' }],
      summary: { total: 0, valid: 0, invalid: 0 },
    };
  }

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // Header is line 1

    // Get values (case-insensitive)
    const name =
      row.Name || row.name || (row as any).NAME || '';
    const phoneRaw =
      row.Phone || row.phone || (row as any).PHONE || '';
    const email =
      row.Email || row.email || (row as any).EMAIL || '';
    const tag =
      row.Tag || row.tag || row.tags || (row as any).TAGS || '';

    // Validate phone (required)
    if (!phoneRaw) {
      errors.push({
        row: rowNum,
        phone: '',
        error: 'Phone number is required',
      });
      return;
    }

    // Validate phone format
    if (!validateIndianPhone(String(phoneRaw))) {
      errors.push({
        row: rowNum,
        phone: String(phoneRaw),
        error: 'Invalid phone format',
      });
      return;
    }

    // Normalize phone
    const { phone, countryCode } = normalizePhone(String(phoneRaw));
    if (!phone) {
      errors.push({
        row: rowNum,
        phone: String(phoneRaw),
        error: 'Invalid phone format after normalization',
      });
      return;
    }

    // Parse name
    const { firstName, lastName } = splitName(String(name));

    // Parse tags
    const tags = parseTags(String(tag));

    // Validate email (optional)
    const emailTrim = String(email || '').trim();
    if (emailTrim && !validateEmail(emailTrim)) {
      errors.push({
        row: rowNum,
        phone: String(phoneRaw),
        error: 'Invalid email format',
      });
      return;
    }

    // Extract custom fields (any column not in standard set)
    const customFields: Record<string, any> = {};
    Object.keys(row).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (!['name', 'phone', 'email', 'tag', 'tags'].includes(lowerKey)) {
        customFields[key] = row[key];
      }
    });

    contacts.push({
      phone,
      countryCode,
      firstName,
      lastName,
      email: emailTrim || null,
      tags,
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
// SAMPLE CSV GENERATION
// ============================================

/**
 * Generate sample CSV content
 */
export function generateSampleCsv(): string {
  return `Full Name,Phone,Email,Tags
Rahul Kumar,9876543210,rahul@example.com,customer
Priya Sharma,+919876543211,priya@example.com,vip|lead
Amit Patel,919876543212,amit@example.com,customer;active
Neha Singh,09876543213,,lead
Vikram Mehta,00919876543214,vikram@example.com,vip`;
}

/**
 * Download sample CSV file
 */
export function downloadSampleCsv(): void {
  const sample = generateSampleCsv();
  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'contacts_sample.csv';
  a.click();

  URL.revokeObjectURL(url);
}

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Convert contacts to CSV format
 */
export function contactsToCsv(
  contacts: Array<{
    phone: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    tags?: string[];
    customFields?: Record<string, any>;
  }>
): string {
  const headers = ['Name', 'Phone', 'Email', 'Tags'];

  // Add custom field headers
  const customFieldKeys = new Set<string>();
  contacts.forEach((contact) => {
    if (contact.customFields) {
      Object.keys(contact.customFields).forEach((key) => customFieldKeys.add(key));
    }
  });
  headers.push(...Array.from(customFieldKeys));

  const rows = contacts.map((contact) => {
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    const tags = contact.tags?.join('|') || '';

    const row = [fullName, contact.phone, contact.email || '', tags];

    // Add custom fields
    customFieldKeys.forEach((key) => {
      row.push(contact.customFields?.[key] || '');
    });

    return row;
  });

  return Papa.unparse({
    fields: headers,
    data: rows,
  });
}

/**
 * Download contacts as CSV
 */
export function downloadContactsCsv(
  contacts: ParsedContact[],
  filename = 'contacts.csv'
): void {
  const csv = contactsToCsv(contacts);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// ============================================
// BATCH VALIDATION
// ============================================

/**
 * Validate array of phone numbers
 */
export function validatePhoneBatch(phones: string[]): {
  valid: string[];
  invalid: Array<{ phone: string; error: string }>;
} {
  const valid: string[] = [];
  const invalid: Array<{ phone: string; error: string }> = [];

  phones.forEach((phone) => {
    const result = validatePhoneInput(phone);
    if (result.valid && result.normalized) {
      valid.push(result.normalized);
    } else {
      invalid.push({ phone, error: result.message });
    }
  });

  return { valid, invalid };
}

// ============================================
// DUPLICATE DETECTION
// ============================================

/**
 * Find duplicate phone numbers in array
 */
export function findDuplicates(contacts: ParsedContact[]): {
  duplicates: Map<string, number>;
  unique: ParsedContact[];
} {
  const seen = new Map<string, number>();
  const unique: ParsedContact[] = [];

  contacts.forEach((contact) => {
    const count = seen.get(contact.phone) || 0;
    seen.set(contact.phone, count + 1);

    if (count === 0) {
      unique.push(contact);
    }
  });

  const duplicates = new Map(
    Array.from(seen.entries()).filter(([_, count]) => count > 1)
  );

  return { duplicates, unique };
}

// ============================================
// UTILITY EXPORTS
// ============================================

export default {
  // Validation
  validateIndianPhone,
  validatePhoneInput,
  validateEmail,
  validatePhoneBatch,

  // Normalization
  normalizePhone,
  formatPhoneForDisplay,

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