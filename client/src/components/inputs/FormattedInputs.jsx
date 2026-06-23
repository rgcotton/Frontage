function stripToSingleDecimal(raw) {
  let cleaned = raw.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }
  return cleaned;
}

export function formatCurrencyLive(raw) {
  const cleaned = stripToSingleDecimal(raw);
  if (!cleaned) return '';
  const [intPart, decPart] = cleaned.split('.');
  const formattedInt = intPart ? Number(intPart).toLocaleString('en-US') : '0';
  return decPart !== undefined ? `$${formattedInt}.${decPart.slice(0, 2)}` : `$${formattedInt}`;
}

export function formatPhoneLive(raw) {
  const digits = raw.replace(/[^0-9]/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatYearLive(raw) {
  return raw.replace(/[^0-9]/g, '').slice(0, 4);
}

function makeFormattedInput(formatter, extraProps = {}) {
  return function FormattedInput({ value, onChange, placeholder }) {
    return (
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(formatter(e.target.value))}
        placeholder={placeholder}
        {...extraProps}
      />
    );
  };
}

export const CurrencyInput = makeFormattedInput(formatCurrencyLive);
export const PhoneInput = makeFormattedInput(formatPhoneLive, { type: 'tel', inputMode: 'numeric' });
export const YearInput = makeFormattedInput(formatYearLive, { inputMode: 'numeric', maxLength: 4 });

// Percent and Square Feet append a trailing suffix (%, SF). Appending it on every keystroke traps
// backspace-from-the-end: removing the suffix character leaves the same digits underneath, which
// immediately reformats back to the same value, making the suffix impossible to delete past. So the
// numeric content is cleaned live, but the suffix itself is only (re-)applied on blur.
function makeSuffixInput(cleanDigits, applySuffix, extraProps = {}) {
  return function SuffixInput({ value, onChange, placeholder }) {
    return (
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(cleanDigits(e.target.value))}
        onBlur={() => onChange(applySuffix(value))}
        placeholder={placeholder}
        {...extraProps}
      />
    );
  };
}

export const PercentInput = makeSuffixInput(
  (raw) => stripToSingleDecimal(raw.replace(/%/g, '')),
  (val) => {
    const cleaned = stripToSingleDecimal(String(val).replace(/%/g, ''));
    return cleaned ? `${cleaned}%` : '';
  }
);

export const SquareFeetInput = makeSuffixInput(
  (raw) => raw.replace(/[^0-9]/g, ''),
  (val) => {
    const digits = String(val).replace(/[^0-9]/g, '');
    return digits ? `${Number(digits).toLocaleString('en-US')} SF` : '';
  }
);
