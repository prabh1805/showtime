import { useState, useEffect } from "react";
import AppHeader from "../components/AppHeader";
import FormField from "../components/FormField";
import CitySelect from "../components/CitySelect";
import Button from "../components/Button";
import FormError from "../components/FormError";
import Modal from "../components/Modal";
import TheatersPanel from "../components/TheatersPanel";
import MoviesPanel from "../components/MoviesPanel";
import { useAuth } from "../context/useAuth";
import { createOwner } from "../api/admin";
import { ApiError } from "../api/client";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateCity,
  mapFieldErrors,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "../lib/validators";

/**
 * Admin dashboard: the only page that calls a backend-enforced,
 * role-gated endpoint (POST /api/v1/admin/owner). Creates a theater Owner
 * and their first theater in one call.
 */
const EMPTY_VALUES = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  city: "",
  theaterName: "",
  address: "",
};

export default function AdminDashboard() {
  const auth = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState(null); // { ownerId, theaterId } | null
  const [touched, setTouched] = useState({});
  const [theatersRefreshKey, setTheatersRefreshKey] = useState(0);

  useEffect(() => {
    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  /**
   * Returns a change handler for a given field name, updating `values`
   * from the input's current value.
   * @param {keyof typeof values} field
   * @returns {(e: import("react").ChangeEvent<HTMLInputElement>) => void}
   */
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

  /**
   * Validates firstName/lastName/email/password/city/theaterName as
   * required (address has no @NotBlank on the backend, so it's optional
   * here too). Populates `errors` via setErrors.
   * @returns {boolean} true if there are no validation errors.
   */
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
    const cityError = validateCity(values.city);
    if (cityError) errorsObj.city = cityError;
    const theaterNameError = validateRequired(
      values.theaterName,
      "Theater name",
    );
    if (theaterNameError) errorsObj.theaterName = theaterNameError;

    setErrors(errorsObj);
    return Object.keys(errorsObj).length === 0;
  }

  /**
   * Validates, then calls createOwner with the current admin's access
   * token. Builds the payload so `address` is OMITTED when blank (the
   * backend's @Size(min=1) rejects an empty string but allows an absent
   * field). On success, shows the returned {ownerId, theaterId}. Maps 400
   * field errors onto per-field state; surfaces anything else via
   * FormError.
   * @param {import("react").FormEvent} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setPending(true);
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        city: values.city,
        theaterName: values.theaterName,
        ...(values.address.trim() ? { address: values.address.trim() } : {}),
      };
      const result = await createOwner(payload, auth.accessToken);
      setCreated(result);
      setValues(EMPTY_VALUES);
      setTouched({});
      setErrors({});
      setTheatersRefreshKey((key) => key + 1);
      setIsModalOpen(false);
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

  /** Opens the create-owner modal with a clean form. */
  function openModal() {
    setIsModalOpen(true);
  }

  /**
   * Closes the create-owner modal and resets its form state, so the next
   * open always starts fresh. No-ops while a submit is in flight.
   */
  function closeModal() {
    if (pending) return;
    setIsModalOpen(false);
    setValues(EMPTY_VALUES);
    setErrors({});
    setTouched({});
    setFormError("");
  }

  const requiredFieldFilled =
    values.firstName.trim() &&
    values.lastName.trim() &&
    values.email.trim() &&
    values.password.trim() &&
    values.city.trim() &&
    values.theaterName.trim();

  const isFormValid = requiredFieldFilled && Object.keys(errors).length === 0;

  return (
    <main className="flex min-h-screen flex-col items-center bg-paper">
      <AppHeader />

      <div className="flex w-full flex-col items-center gap-6 px-6 py-8">
        <div className="flex w-full max-w-5xl flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
                Admin console
              </h1>
              <p className="mt-1 text-sm text-mist">
                Provision theater Owners and curate the movie catalog.
              </p>
            </div>
            <Button type="button" onClick={openModal} className="sm:w-auto">
              Create owner
            </Button>
          </div>

          {created && (
            <div
              role="status"
              className="rounded-md border border-marquee/30 bg-marquee/10 px-4 py-3 text-sm text-marquee"
            >
              Created owner #{created.ownerId} with theater #
              {created.theaterId}.
            </div>
          )}
        </div>

        <Modal
          open={isModalOpen}
          onClose={closeModal}
          title="Create an owner"
          closeDisabled={pending}
        >
          <p className="mt-1 text-sm text-mist">
            Provisions an Owner account and their first theater.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-6 flex flex-col gap-4"
          >
            <FormError message={formError} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="firstName"
                label="Owner first name"
                value={values.firstName}
                onChange={handleChange("firstName")}
                error={touched.firstName ? errors.firstName : undefined}
                onBlur={handleBlur("firstName")}
                autoComplete="given-name"
              />
              <FormField
                id="lastName"
                label="Owner last name"
                value={values.lastName}
                onChange={handleChange("lastName")}
                error={touched.lastName ? errors.lastName : undefined}
                onBlur={handleBlur("lastName")}
                autoComplete="family-name"
              />
            </div>

            <FormField
              id="email"
              label="Owner email"
              type="email"
              value={values.email}
              onChange={handleChange("email")}
              error={touched.email ? errors.email : undefined}
              onBlur={handleBlur("email")}
              autoComplete="off"
            />

            <div>
              <FormField
                id="password"
                label="Owner password"
                type="password"
                value={values.password}
                onChange={handleChange("password")}
                error={touched.password ? errors.password : undefined}
                onBlur={handleBlur("password")}
                autoComplete="new-password"
              />
              <p className="mt-1.5 text-xs text-mist">
                {PASSWORD_REQUIREMENTS_MESSAGE}
              </p>
            </div>

            <FormField
              id="theaterName"
              label="Theater name"
              value={values.theaterName}
              onChange={handleChange("theaterName")}
              error={touched.theaterName ? errors.theaterName : undefined}
              onBlur={handleBlur("theaterName")}
            />

            <CitySelect
              id="city"
              label="City"
              value={values.city}
              onChange={(city) => setValues((prev) => ({ ...prev, city }))}
              error={touched.city ? errors.city : undefined}
              onBlur={handleBlur("city")}
            />

            <FormField
              id="address"
              label="Address (optional)"
              value={values.address}
              onChange={handleChange("address")}
              error={touched.address ? errors.address : undefined}
              onBlur={handleBlur("address")}
            />

            <div className="mt-2 flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                pending={pending}
                disabled={pending || !isFormValid}
                className="w-full sm:w-auto"
              >
                Create owner
              </Button>
              <Button
                type="button"
                onClick={closeModal}
                disabled={pending}
                className="w-full bg-transparent! text-ink! ring-1 ring-inset ring-hairline hover:bg-paper! sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        <TheatersPanel refreshKey={theatersRefreshKey} />

        <MoviesPanel />
      </div>
    </main>
  );
}
