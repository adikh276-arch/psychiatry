export const parseDbDate = (dateVal: string | Date | undefined | null): Date => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;

  let str = dateVal.toString();
  if (!str.includes('Z') && !str.includes('+') && str.length > 10) {
    str = str.replace(' ', 'T');
    if (!str.endsWith('Z')) {
      str += 'Z';
    }
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
};

export const formatLocalTime = (dateVal: string | Date | undefined | null, lang: string = 'en-US'): string => {
  const d = parseDbDate(dateVal);
  return d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
};

export const formatLocalDate = (dateVal: string | Date | undefined | null, lang: string = 'en-US'): string => {
  const d = parseDbDate(dateVal);
  return d.toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' });
};
