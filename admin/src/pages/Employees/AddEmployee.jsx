import Card from "../../components/common/Card.jsx";
import Button from "../../components/common/Button.jsx";
import { FormInput, FormSelect } from "../../components/common/FormFields.jsx";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Icon from "../../components/common/Icon.jsx";
import PersonalInfoForm from "../../components/employees/PersonalInfoForm.jsx";
import JobDetailsForm from "../../components/employees/JobDetailsForm.jsx";
import {
  JOB_GRADES,
  PORTAL_ROLES,
  INITIAL_DEPARTMENTS,
} from "../../utils/constants/constants.js";
import { validateEmployeeRules } from "../../utils/validation/validators.js";
import { getEmployeeSchema } from "../../utils/validation/workforceSchemas.js";
import { normalizeAccountLogin } from "../../utils/helpers/accountIdentity.js";

export default function AddEmployee({
  employee,
  employees,
  departments = INITIAL_DEPARTMENTS,
  grades = JOB_GRADES,
  onSave,
  onCancel,
  onDirtyChange,
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      id: "",
      name: "",
      email: "",
      gender: "",
      birthDate: "",
      qualification: "",
      department: "",
      grade: "",
      employmentType: "Permanent",
      hiredDate: "",
      portalRole: "Employee",
      photo: null,
      educationDocument: null,
      status: "Active",
      ...employee,
      temporaryPassword: "",
    },
    // Keep upload objects and optional fields intact; normalize on save below.
    resolver: zodResolver(
      getEmployeeSchema({ originalId: employee?.id }),
      undefined,
      { raw: true },
    ),
    shouldFocusError: false,
  });
  const [grade, photo, educationDocument] = useWatch({
    control,
    name: ["grade", "photo", "educationDocument"],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  // File contents cannot be compared by React Hook Form's dirty tracking.
  const [uploadsDirty, setUploadsDirty] = useState(false);
  const editing = Boolean(employee);
  const departmentOptions = departments
    .filter(
      (department) =>
        department.status === "Active" ||
        department.name === employee?.department,
    )
    .map((department) => department.name);

  useEffect(() => {
    onDirtyChange(isDirty || uploadsDirty);
  }, [isDirty, uploadsDirty, onDirtyChange]);

  function changeUpload(name, value) {
    setValue(name, value, { shouldDirty: true });
    setUploadsDirty(true);
  }

  async function submit(values) {
    if (photoBusy) return;
    const nextErrors = validateEmployeeRules(values, employees, employee?.id, {
      departments: departmentOptions,
      grades,
    });
    if (Object.keys(nextErrors).length) {
      for (const [name, message] of Object.entries(nextErrors)) {
        setError(name, { type: "business", message });
      }
      setFocus(Object.keys(nextErrors)[0]);
      return;
    }
    // Keep the temporary password transient; no credentials are saved or exported.
    const record = {
      id: values.id.trim(),
      name: values.name.trim(),
      email: normalizeAccountLogin(values.email),
      gender: values.gender,
      birthDate: values.birthDate,
      qualification: values.qualification.trim(),
      department: values.department,
      grade: values.grade,
      employmentType: values.employmentType,
      hiredDate: values.hiredDate,
      portalRole: values.portalRole,
      photo: values.photo,
      educationDocument: values.educationDocument,
      status: values.status,
      basicSalary:
        grades.find((grade) => grade.name === values.grade)?.salary || 0,
    };
    try {
      await onSave(record, employee?.id);
    } catch (error) {
      setError("root", {
        type: "server",
        message:
          error.message || "Employee could not be saved. Please try again.",
      });
    }
  }

  return (
    <div className="employee-editor tw:max-w-[1200px] tw:m-[0_auto_28px]">
      <div
        className="employee-page-heading tw:flex tw:items-center tw:gap-[13px] tw:mb-[23px] tw:[&>div]:min-w-0 tw:[&>div]:flex-1
          tw:[&>.button]:shrink-0 tw:max-[768px]:flex-wrap tw:max-[768px]:gap-[11px]
          tw:max-[768px]:[&>.button]:ml-auto tw:[&_h1]:text-[27px] tw:[&_h1]:tracking-[-0.6px]
          tw:max-[768px]:[&_h1]:text-[24px] tw:max-[560px]:[&_h1]:text-[22px] tw:[&_p]:text-[var(--text-muted)]
          tw:[&_p]:text-[12px] tw:[&_p]:leading-[1.7] tw:[&_p]:mt-[4px] tw:max-[768px]:[&_p]:text-[11px]
          tw:shared-base:flex tw:shared-base:items-center tw:shared-base:gap-[13px] tw:shared-base:mb-[23px]
          tw:shared-base:[&_>_div]:min-w-0 tw:shared-base:[&_>_div]:flex-1 tw:shared-base:[&_h1]:text-[27px]
          tw:shared-base:[&_h1]:tracking-[-0.6px] tw:shared-base:[&_p]:[color:var(--text-muted)]
          tw:shared-base:[&_p]:text-[12px] tw:shared-base:[&_p]:leading-[1.7] tw:shared-base:[&_p]:mt-[4px]
          tw:shared-base:[&_>_.button]:shrink-0 tw:max-[768px]:shared-base:flex-wrap
          tw:max-[768px]:shared-base:gap-[11px]
          tw:max-[768px]:shared-base:[&_h1]:text-[24px]
          tw:max-[768px]:shared-base:[&_p]:text-[11px]
          tw:max-[768px]:shared-base:[&_>_.button]:ml-[auto]
          tw:max-[560px]:shared-base:[&_h1]:text-[22px]"
      >
        <button
          className="back-button tw:inline-flex tw:items-center tw:justify-center tw:w-[40px] tw:h-[40px] tw:p-[9px] tw:shrink-0
            tw:bg-white tw:[border:1px_solid_var(--border)] tw:rounded-[9px] tw:text-text-secondary
            tw:hover:border-[#a0cec1] tw:hover:text-primary"
          onClick={onCancel}
          aria-label="Back to employee directory"
        >
          <Icon name="arrow-left" />
        </button>
        <div>
          <h1>{editing ? "Edit Employee" : "Add New Department Employee"}</h1>
          <p>
            {editing
              ? "Review and update this employee’s information."
              : "Create an official staff record with identity, placement, and portal details."}
          </p>
        </div>
      </div>
      <Card
        as="form"
        className="employee-registration-form tw:p-[29px_30px] tw:max-[1100px]:p-[24px] tw:max-[768px]:p-[22px_18px]"
        onSubmit={handleSubmit(submit, (errors) =>
          setFocus(Object.keys(errors)[0]),
        )}
        noValidate
        aria-busy={isSubmitting}
      >
        <PersonalInfoForm
          register={register}
          photo={photo}
          errors={errors}
          onChangeUpload={changeUpload}
          onPhotoBusy={setPhotoBusy}
        />
        <JobDetailsForm
          departments={departmentOptions}
          grades={grades}
          register={register}
          grade={grade}
          educationDocument={educationDocument}
          errors={errors}
          onChangeUpload={changeUpload}
          editing={editing}
        />
        <fieldset
          className="employee-form-section portal-account-section tw:[border:0] tw:m-[0_0_30px] tw:p-0 tw:min-w-0 tw:[&>legend]:flex
          tw:[&>legend]:items-center tw:[&>legend]:gap-[11px] tw:[&>legend]:w-full tw:[&>legend]:p-[0_0_16px]
          tw:[&>legend]:mb-[22px] tw:[&>legend]:[border-bottom:1px_solid_#e4eee9] tw:[&>legend]:text-[14px]
          tw:[&>legend]:font-[650] tw:[&>legend]:text-[#154d44] tw:[&>legend_small]:block
          tw:[&>legend_small]:text-[8px] tw:[&>legend_small]:tracking-[1.3px] tw:[&>legend_small]:text-[#71928a]
          tw:[&>legend_small]:mb-[4px] tw:[&>legend_small]:font-[600] tw:max-[768px]:[&>legend]:text-[13px]
          tw:max-[560px]:[&>legend]:leading-[1.6] tw:max-[560px]:[&>legend]:items-start
          tw:[&.portal-account-section]:bg-[#f2faf6] tw:[&.portal-account-section]:[border:1px_solid_#dbeee3]
          tw:[&.portal-account-section]:rounded-[10px] tw:[&.portal-account-section]:p-[21px]
          tw:[&.portal-account-section]:m-[36px_0_0] tw:max-[768px]:[&.portal-account-section]:p-[17px]
          tw:[&.portal-account-section>legend]:float-left tw:[&.portal-account-section>legend]:[border:0]
          tw:[&.portal-account-section>legend]:p-0 tw:[&.portal-account-section>legend]:m-[0_0_12px]
          tw:[&>p]:clear-both tw:[&>p]:m-[0_0_22px] tw:[&>p]:text-[var(--text-muted)] tw:[&>p]:text-[12px]
          tw:[&>p]:leading-[1.7]"
        >
          <legend>
            <span
              className="form-section-icon tw:inline-flex tw:items-center tw:justify-center tw:w-[36px] tw:h-[36px] tw:rounded-[8px]
          tw:bg-[#e9f7f1] tw:text-primary tw:shrink-0"
            >
              <Icon name="key" size={20} />
            </span>
            <span>
              <small>STEP 03</small>Portal Login Account & Role Assignment
            </span>
          </legend>
          <p>
            Configure the requested portal role
            {editing ? "." : " and temporary initial password."}
          </p>
          <div
            className="employee-fields-grid tw:grid tw:grid-cols-3 tw:gap-[23px_22px] tw:max-[1100px]:gap-[20px_17px]
          tw:max-[768px]:grid-cols-2 tw:max-[560px]:grid-cols-[minmax(0,_1fr)] tw:[&>label]:block
          tw:[&>label]:text-[#48655f] tw:[&>label]:text-[11px] tw:[&>label]:font-[650] tw:[&>label]:leading-[1.5]
          tw:[&>label>span:not(.password-field)]:text-[#b65265] tw:[&_.span-two]:[grid-column:span_2]
          tw:max-[768px]:[&_.span-two]:col-span-full tw:max-[560px]:[&_.span-two]:col-auto tw:shared-base:grid
          tw:shared-base:grid-cols-[repeat(3,_minmax(0,_1fr))] tw:shared-base:gap-[23px_22px]
          tw:shared-base:[&_>_label]:block tw:shared-base:[&_>_label]:[color:#48655f]
          tw:shared-base:[&_>_label]:text-[11px] tw:shared-base:[&_>_label]:font-[650]
          tw:shared-base:[&_>_label]:leading-[1.5]
          tw:shared-base:[&_>_label_>_span:not(.password-field)]:[color:#b65265]
          tw:shared-base:[&_.span-two]:col-[span_2] tw:max-[1100px]:shared-base:gap-[20px_17px]
          tw:max-[768px]:shared-base:grid-cols-[repeat(2,_minmax(0,_1fr))]
          tw:max-[768px]:shared-base:[&_.span-two]:col-[1_/_-1]
          tw:max-[560px]:shared-base:grid-cols-[minmax(0,_1fr)]
          tw:max-[560px]:shared-base:[&_.span-two]:col-[auto]
          tw:max-[560px]:shared-base:[&_>_label]:text-[11px]"
          >
            <label>
              {editing
                ? "Official email / Existing login ID"
                : "Registered email"}{" "}
              <span>*</span>
              <FormInput
                variant="employee"
                {...register("email")}
                placeholder="e.g. yohannes@hadiya.gov.et"
                maxLength={100}
                autoComplete="off"
                required
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <small
                  className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]"
                >
                  {errors.email.message}
                </small>
              )}
            </label>
            <label>
              Portal role <span>*</span>
              <FormSelect
                variant="employee"
                {...register("portalRole")}
                required
                aria-invalid={!!errors.portalRole}
              >
                {PORTAL_ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </FormSelect>
              <small className="tw:mt-[7px] tw:block tw:text-[10px] tw:font-normal tw:text-[var(--text-muted)]">
                A department head uses this email to sign in. Replace an
                existing head from Departments.
              </small>
              {errors.portalRole && (
                <small
                  className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]"
                >
                  {errors.portalRole.message}
                </small>
              )}
            </label>
            {!editing ? (
              <label>
                Temporary initial password <span>*</span>
                <span className="password-field tw:block tw:relative tw:[&_input]:pr-[43px]!">
                  <FormInput
                    variant="employee"
                    {...register("temporaryPassword")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    maxLength={128}
                    aria-invalid={!!errors.temporaryPassword}
                  />
                  <button
                    className="tw:absolute tw:right-[5px] tw:top-[5px] tw:inline-flex tw:items-center tw:justify-center tw:w-[35px] tw:h-[35px]
          tw:[border:0] tw:rounded-[5px] tw:text-[#79958b] tw:bg-transparent tw:hover:bg-[#edf7f0]
          tw:hover:text-primary"
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
                  </button>
                </span>
                {errors.temporaryPassword && (
                  <small
                    className="field-error tw:shared-base:block tw:shared-base:text-[11px] tw:shared-base:font-normal
          tw:shared-base:[color:#b33450] tw:shared-base:mt-[7px] tw:shared-base:leading-[1.6]"
                  >
                    {errors.temporaryPassword.message}
                  </small>
                )}
              </label>
            ) : null}
          </div>
        </fieldset>
        {errors.root && (
          <p
            className="form-error tw:shared-base:mt-[16px] tw:shared-base:text-[13px] tw:shared-base:rounded-[5px]
          tw:shared-base:p-[10px_12px] tw:shared-base:leading-[1.6] tw:shared-base:[color:#b42344]
          tw:shared-base:[background:#fff0f3]"
            role="alert"
          >
            {errors.root.message}
          </p>
        )}
        <div
          className="registration-footer tw:flex tw:items-center tw:justify-between tw:gap-[20px]
          tw:[border-top:1px_solid_var(--divider)] tw:mt-[30px] tw:pt-[23px] tw:[&>p]:flex tw:[&>p]:items-start
          tw:[&>p]:gap-[8px] tw:[&>p]:max-w-[500px] tw:[&>p]:text-[10px] tw:[&>p]:leading-[1.8]
          tw:[&>p]:text-[var(--text-muted)] tw:[&>p_svg]:mt-[1px] tw:[&>div]:flex tw:[&>div]:items-center
          tw:[&>div]:gap-[10px] tw:[&>div]:shrink-0 tw:max-[1100px]:items-start tw:max-[1100px]:flex-col
          tw:max-[1100px]:[&>div]:self-end tw:max-[560px]:[&>div]:w-full tw:max-[560px]:[&>div>.button]:flex-1
          tw:max-[560px]:[&>div>.button]:px-[10px]"
        >
          <p>
            <Icon name="info" size={16} />
            Review the employee details before saving.
          </p>
          <div>
            <Button variant="secondary" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={photoBusy || isSubmitting}>
              <Icon name={editing ? "check" : "users"} size={18} />
              {photoBusy
                ? "Reading photo…"
                : isSubmitting
                  ? "Saving…"
                  : editing
                    ? "Save Changes"
                    : "Register Employee"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
