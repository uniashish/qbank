import { SCHOOL_STATUS_OPTIONS } from "../../constants/schoolStatus.js";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import SchoolFormField from "./SchoolFormField.jsx";

function SchoolForm({
  errors,
  feedback,
  isSubmitting,
  onChange,
  onSubmit,
  values,
}) {
  return (
    <form className="school-form" noValidate onSubmit={onSubmit}>
      {feedback.message && (
        <div
          className={`school-feedback school-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </div>
      )}

      <div className="school-form__grid">
        <SchoolFormField
          autoComplete="organization"
          error={errors.name}
          label="School Name"
          name="name"
          onChange={onChange}
          placeholder="ABC International School"
          required
          value={values.name}
        />
        <SchoolFormField
          autoComplete="off"
          error={errors.code}
          helperText="Use a short internal code for reporting and lookup."
          label="School Code"
          name="code"
          onChange={onChange}
          placeholder="ABC001"
          required
          value={values.code}
        />
        <SchoolFormField
          autoComplete="email"
          error={errors.email}
          label="School Email"
          name="email"
          onChange={onChange}
          placeholder="admin@abcschool.com"
          type="email"
          value={values.email}
        />
        <SchoolFormField
          autoComplete="tel"
          error={errors.phone}
          label="Phone"
          name="phone"
          onChange={onChange}
          placeholder="+1 555 0100"
          type="tel"
          value={values.phone}
        />
        <SchoolFormField
          autoComplete="address-line1"
          error={errors.address}
          label="Address"
          name="address"
          onChange={onChange}
          placeholder="Street address"
          value={values.address}
        />
        <SchoolFormField
          autoComplete="address-level2"
          error={errors.city}
          label="City"
          name="city"
          onChange={onChange}
          placeholder="City"
          value={values.city}
        />
        <SchoolFormField
          autoComplete="country-name"
          error={errors.country}
          label="Country"
          name="country"
          onChange={onChange}
          placeholder="Country"
          value={values.country}
        />
        <FormField
          error={errors.status}
          htmlFor="school-status"
          label="Status"
        >
          <select
            aria-describedby={errors.status ? "school-status-error" : undefined}
            aria-invalid={Boolean(errors.status)}
            className="input school-form__select"
            id="school-status"
            name="status"
            onChange={onChange}
            value={values.status}
          >
            {SCHOOL_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="school-form__actions">
        <Button isLoading={isSubmitting} type="submit">
          {isSubmitting ? "Creating school..." : "Create school"}
        </Button>
      </div>
    </form>
  );
}

export default SchoolForm;
