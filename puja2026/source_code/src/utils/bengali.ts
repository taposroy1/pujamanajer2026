/**
 * Bengali numeral converter and formatting utilities
 */

const englishToBengaliDigits: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const bengaliToEnglishDigits: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

/**
 * Converts any number or string of digits to Bengali digits.
 */
export function toBengaliNumber(input: number | string): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (digit) => englishToBengaliDigits[digit] || digit);
}

/**
 * Converts Bengali digits back to standard ASCII digits.
 */
export function toEnglishNumber(input: string): string {
  if (!input) return '';
  return input.replace(/[০-৯]/g, (bDigit) => bengaliToEnglishDigits[bDigit] || bDigit);
}

/**
 * Formats a currency amount in Bengali style with commas and ৳ symbol.
 * Example: 82055 -> ৳৮২,০৫৫
 */
export function formatBengaliCurrency(amount: number): string {
  // Format with standard Indian/South Asian grouping if applicable, or locale formatting
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  return `৳${toBengaliNumber(formatted)}`;
}

/**
 * Formats a percentage in Bengali digits.
 * Example: 41.2 -> ৪১%
 */
export function formatBengaliPercentage(collected: number, target: number): string {
  if (!target || target <= 0) return '০%';
  const percent = Math.min(100, Math.round((collected / target) * 100));
  return `${toBengaliNumber(percent)}%`;
}

/**
 * Generates a clean human-readable reference ID
 * Example: SDP-8942
 */
export function generateReferenceId(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `SDP-${randomDigits}`;
}

/**
 * Formats ISO date string into Bengali readable date
 */
export function formatBengaliDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const day = toBengaliNumber(date.getDate());
    const month = months[date.getMonth()];
    const year = toBengaliNumber(date.getFullYear());
    let hours = date.getHours();
    const minutes = toBengaliNumber(date.getMinutes().toString().padStart(2, '0'));
    const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
    hours = hours % 12 || 12;
    const hourBn = toBengaliNumber(hours);

    return `${day} ${month}, ${year} (${hourBn}:${minutes} ${ampm})`;
  } catch {
    return isoString;
  }
}
