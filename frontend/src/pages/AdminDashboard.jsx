import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import FormField from "../components/FormField";
import Button from "../components/Button";
import FormError from "../components/FormError";
import { useAuth } from "../context/AuthContext";
import { createOwner } from "../api/admin";
import { ApiError } from "../api/client";
import {
  validateEmail,
  validatePassword,
  validateRequired,
  mapFieldErrors,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "../lib/validators";

/**
 * Admin dashboard: the only page that calls a backend-enforced,
 * role-gated endpoint (POST /api/v1/admin/owner). Creates a theater Owner
 * and their first theater in one call.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [values, setValues] = useState({
    email: "",
    password: "",
    city: "",
    theaterName: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [created, setCreated] = useState(null); // { ownerId, theaterId } | null

  /**
   * Returns a change handler for a given field name, updating `values`
   * from the input's current value.
   * @param {keyof typeof values} field
   * @returns {(e: import("react").ChangeEvent<HTMLInputElement>) => void}
   */
  function handleChange(field) {
    // TODO: return (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  /**
   * Validates email/password/city/theaterName as required (address has no
   * @NotBlank on the backend, so it's optional here too). Populates
   * `errors` via setErrors.
   * @returns {boolean} true if there are no validation errors.
   */
  function validate() {
    // TODO: build an errors object using validateRequired/validateEmail/
    // validatePassword, setErrors(errorsObj), return Object.keys(errorsObj).length === 0.
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
    // TODO: e.preventDefault(); setFormError(""); if (!validate()) return;
    // setPending(true);
    // try {
    //   const payload = {
    //     email: values.email,
    //     password: values.password,
    //     city: values.city,
    //     theaterName: values.theaterName,
    //     ...(values.address.trim() ? { address: values.address.trim() } : {}),
    //   };
    //   const result = await createOwner(payload, auth.accessToken);
    //   setCreated(result);
    //   setValues({ email: "", password: "", city: "", theaterName: "", address: "" });
    // } catch (err) {
    //   if (err instanceof ApiError && err.status === 400) {
    //     setErrors(mapFieldErrors(err.body?.fieldErrors));
    //   } else {
    //     setFormError(err instanceof ApiError ? err.body?.message : "Something went wrong.");
    //   }
    // } finally {
    //   setPending(false);
    // }
  }

  /** Logs out and returns to the login page. */
  function handleLogout() {
    auth.logout();
    navigate("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-paper px-6 py-12">
      <div className="flex w-full max-w-md items-center justify-between">
        <Logo />
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-mist hover:text-velvet"
        >
          Log out
        </button>
      </div>

      <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 text-left shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-wide text-ink">
          Create an owner
        </h1>
        <p className="mt-1 text-sm text-mist">
          Provisions an Owner account and their first theater.
        </p>

        {created && (
          <div
            role="status"
            className="mt-4 rounded-md border border-marquee/30 bg-marquee/10 px-4 py-3 text-sm text-marquee"
          >
            Created owner #{created.ownerId} with theater #{created.theaterId}.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          <FormError message={formError} />

          <FormField
            id="email"
            label="Owner email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            error={errors.email}
            autoComplete="off"
          />

          <div>
            <FormField
              id="password"
              label="Owner password"
              type="password"
              value={values.password}
              onChange={handleChange("password")}
              error={errors.password}
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
            error={errors.theaterName}
          />

          <FormField
            id="city"
            label="City"
            value={values.city}
            onChange={handleChange("city")}
            error={errors.city}
          />

          <FormField
            id="address"
            label="Address (optional)"
            value={values.address}
            onChange={handleChange("address")}
            error={errors.address}
          />

          <Button pending={pending} className="mt-2 w-full">
            Create owner
          </Button>
        </form>
      </div>
    </main>
  );
}
