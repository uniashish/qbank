const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeInviteValues(values) {
  return {
    email: values.email.trim().toLowerCase(),
    name: values.name.trim(),
  };
}

export function validateInviteForm(
  values,
  {
    emailRequiredMessage = "Enter the invitee's email address.",
    emailValidMessage = "Enter a valid email address.",
    nameRequiredMessage = "Enter the invitee's full name.",
  } = {},
) {
  const normalizedValues = normalizeInviteValues(values);
  const errors = {
    email: "",
    name: "",
  };

  if (!normalizedValues.name) {
    errors.name = nameRequiredMessage;
  }

  if (!normalizedValues.email) {
    errors.email = emailRequiredMessage;
  }

  if (normalizedValues.email && !emailPattern.test(normalizedValues.email)) {
    errors.email = emailValidMessage;
  }

  return {
    errors,
    isValid: !Object.values(errors).some(Boolean),
    values: normalizedValues,
  };
}

export function normalizeInviteAdminValues(values) {
  return normalizeInviteValues(values);
}

export function validateInviteAdminForm(values) {
  return validateInviteForm(values, {
    emailRequiredMessage: "Enter the administrator's email address.",
    emailValidMessage: "Enter a valid administrator email address.",
    nameRequiredMessage: "Enter the administrator's full name.",
  });
}

export function validateInviteTeacherForm(values) {
  return validateInviteForm(values, {
    emailRequiredMessage: "Enter the teacher's email address.",
    emailValidMessage: "Enter a valid teacher email address.",
    nameRequiredMessage: "Enter the teacher's full name.",
  });
}
