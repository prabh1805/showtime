import { useState } from "react";
import Modal from "./Modal";
import FormField from "./FormField";
import Button from "./Button";
import FormError from "./FormError";
import { addStaff } from "../api/theaterStaff";
import { ApiError } from "../api/client";
import { useAuth } from "../context/useAuth";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  mapFieldErrors,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "../lib/validators";

const EMPTY_VALUES = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  mobileNumber: "",
};

/**
 * Owner-only "Add staff" form: creates a new STAFF user and attaches them to
 * the given theater in one call. Same field-level validation UX as
 * `Register.jsx` (touched/errors on blur + change).
 *
 * @param {{ theaterId: number, open: boolean, onClose: () => void, onCreated?: (staff: object) => void }} props
 */
export default function AddStaffModal({ theaterId, open, onClose, onCreated = () => {} }) {
  const { accessToken } = useAuth();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState(null);

  function handleChange(field) {
    return (e) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleBlur(field) {
    return () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    };
  }

  function validate() {
    const errorsObj = {};
    const firstNameError = validateRequired(values.firstName, "First name");
    if (firstNameError) errorsObj.firstName = firstNameError;

    const lastNameError = validateRequired(values.lastName, "Last name");
    if (lastNameError) errorsObj.lastName = lastNameError;

    const emailError = validateEmail(values.email);
    if (emailError) errorsObj.email = emailError;

    const passwordError = validatePassword(values.password);
    if (passwordError) errorsObj.password = passwordError;

    setErrors(errorsObj);
    return Object.keys(errorsObj).length === 0;
  }

  function handleClose() {
    if (pending) return;
    setValues(EMPTY_VALUES);
    setErrors({});
    setTouched({});
    setFormError("");
    setCreated(null);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setPending(true);
    try {
      const staff = await addStaff(
        theaterId,
        { ...values, mobileNumber: values.mobileNumber || undefined },
        accessToken,
      );
      setCreated(staff);
      onCreated(staff);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setErrors(mapFieldErrors(err.body?.fieldErrors));
      } else {
        setFormError(
          err instanceof ApiError ? err.body?.message : "Something went wrong.",
        );
      }
    } finally {
      setPending(false);
    }
  }

  const requiredFieldFilled =
    values.firstName.trim() !== "" &&
    values.lastName.trim() !== "" &&
    values.email.trim() !== "" &&
    values.password.trim() !== "";
  const isFormValid = requiredFieldFilled && Object.keys(errors).length === 0;

  return (
    <Modal open={open} onClose={handleClose} title="Add staff" closeDisabled={pending}>
      {created ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-base text-ink">
            <span className="font-medium">{created.staffEmail}</span> was added
            as staff.
          </p>
          <Button type="button" onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-4 flex flex-col gap-4"
        >
          <FormError message={formError} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="staff-firstName"
              label="First name"
              value={values.firstName}
              onChange={handleChange("firstName")}
              error={touched.firstName ? errors.firstName : undefined}
              onBlur={handleBlur("firstName")}
              autoComplete="given-name"
            />
            <FormField
              id="staff-lastName"
              label="Last name"
              value={values.lastName}
              onChange={handleChange("lastName")}
              error={touched.lastName ? errors.lastName : undefined}
              onBlur={handleBlur("lastName")}
              autoComplete="family-name"
            />
          </div>

          <FormField
            id="staff-email"
            label="Email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            error={touched.email ? errors.email : undefined}
            onBlur={handleBlur("email")}
            autoComplete="email"
          />

          <div>
            <FormField
              id="staff-password"
              label="Password"
              type="password"
              value={values.password}
              onChange={handleChange("password")}
              error={touched.password ? errors.password : undefined}
              onBlur={handleBlur("password")}
              autoComplete="new-password"
            />
            <p className="mt-1.5 text-sm text-mist sm:text-base">
              {PASSWORD_REQUIREMENTS_MESSAGE}
            </p>
          </div>

          <FormField
            id="staff-mobileNumber"
            label="Mobile number (optional)"
            type="tel"
            value={values.mobileNumber}
            onChange={handleChange("mobileNumber")}
            error={touched.mobileNumber ? errors.mobileNumber : undefined}
            onBlur={handleBlur("mobileNumber")}
            autoComplete="tel"
          />

          <Button
            pending={pending}
            disabled={pending || !isFormValid}
            className="mt-2 w-full"
          >
            Add staff
          </Button>
        </form>
      )}
    </Modal>
  );
}
