// Backend connection point: replace only these async methods with HTTP calls.
// Context contains local demo state; never send it or the roster as an API body.
import {
  INITIAL_PAYROLL_RUNS,
  INITIAL_PAYROLL_DEDUCTIONS,
  INITIAL_PAYROLL_POLICY,
  INITIAL_PAYROLL_MONTHLY_POLICIES,
} from "../../utils/constants/constants.js";
import {
  generatePayroll,
  savePayrollDeduction,
  deletePayrollDeduction,
} from "./payrollService.js";
import { validatePayrollResponse } from "./payrollValidation.js";
import { changePayrollPolicyDeduction } from "./payrollPolicyService.js";

export function createPayrollApi({ now = () => new Date() } = {}) {
  return {
    async load() {
      return structuredClone({
        runs: INITIAL_PAYROLL_RUNS,
        deductions: INITIAL_PAYROLL_DEDUCTIONS,
        policy: INITIAL_PAYROLL_POLICY,
        monthlyPolicies: INITIAL_PAYROLL_MONTHLY_POLICIES,
      });
    },
    async generate(input, { data, employees }) {
      return validatePayrollResponse(
        generatePayroll(data, employees, input, now()),
      );
    },
    async saveDeduction(input, { data, employees }) {
      return validatePayrollResponse(
        savePayrollDeduction(data, employees, input, now()),
      );
    },
    async deleteDeduction(input, { data }) {
      return validatePayrollResponse(
        deletePayrollDeduction(data, input, now()),
      );
    },
    async changePolicyDeduction(input, { data, employees = [] }) {
      return validatePayrollResponse(
        changePayrollPolicyDeduction(data, employees, input, now()),
      );
    },
  };
}
export default createPayrollApi();
