import { SCHOOL_STATUSES } from "../constants/schoolStatus.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedStatuses = new Set(Object.values(SCHOOL_STATUSES));

export function normalizeSchoolFormValues(values) {
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    country: values.country.trim(),
    status: values.status,
  };
}

export function validateSchoolForm(values) {
  const normalizedValues = normalizeSchoolFormValues(values);
  const errors = {
    address: "",
    city: "",
    code: "",
    country: "",
    email: "",
    name: "",
    phone: "",
    status: "",
  };

  if (!normalizedValues.name) {
    errors.name = "Enter the school name.";
  }

  if (!normalizedValues.code) {
    errors.code = "Enter the school code.";
  }

  if (normalizedValues.email && !emailPattern.test(normalizedValues.email)) {
    errors.email = "Enter a valid school email address.";
  }

  if (!allowedStatuses.has(normalizedValues.status)) {
    errors.status = "Choose a valid school status.";
  }

  return {
    errors,
    isValid: !Object.values(errors).some(Boolean),
    values: normalizedValues,
  };
}
