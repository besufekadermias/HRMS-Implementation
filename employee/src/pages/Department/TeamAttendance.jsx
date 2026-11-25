import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import useDepartmentData from "../../hooks/department/useDepartmentData.js";
import { loadDepartmentAttendance } from "../../services/department/departmentService.js";
import { ATTENDANCE_STATUS_LABELS } from "../../utils/validation/attendanceSchemas.js";
import { formatAttendanceDate } from "../../utils/formatters/attendanceTime.js";
import DepartmentPage from "../../components/department/DepartmentPage.jsx";
import DepartmentPagination from "../../components/department/DepartmentPagination.jsx";
import TeamAttendanceTable from "../../components/department/TeamAttendanceTable.jsx";

export default function TeamAttendance() {
  const resource = useDepartmentData(loadDepartmentAttendance);
  const { search, onSearch } = useOutletContext();
  const [date, setDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const employees = resource.data?.employees || [];
  const dates = [
    ...new Set((resource.data?.records || []).map((record) => record.date)),
  ];
  const members = new Map(employees.map((employee) => [employee.id, employee]));
  const query = search.trim().toLowerCase();
  const records = (resource.data?.records || []).filter((record) => {
    const member = members.get(record.employeeId);
    return (
      (!date || record.date === date) &&
      (!employeeId || record.employeeId === employeeId) &&
      (!status || record.status === status) &&
      [member.fullName, member.serialNumber].some((value) =>
        value.toLowerCase().includes(query),
      )
    );
  });
  const current = Math.min(page, Math.max(1, Math.ceil(records.length / 10)));
  return (
    <DepartmentPage
      title="Team Attendance"
      description="Review the latest 30 recorded workdays for your department. Times use East Africa Time (UTC+3)."
      resource={resource}
    >
      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5 [&_label]:block [&_label]:text-[12px] [&_label]:font-semibold [&_input]:mt-2 [&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-border [&_input]:px-3 [&_input]:text-[13px] [&_select]:mt-2 [&_select]:min-h-11 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-border [&_select]:bg-white [&_select]:px-3 [&_select]:text-[13px]">
          <label>
            Search employee
            <input
              aria-label="Search attendance employee"
              value={search}
              onChange={(event) => {
                onSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Name or employee ID"
            />
          </label>
          <label>
            Work date
            <select
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All saved dates</option>
              {dates.map((value) => (
                <option key={value} value={value}>
                  {formatAttendanceDate(value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Team member
            <select
              value={employeeId}
              onChange={(event) => {
                setEmployeeId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All team members</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Attendance status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {Object.entries(ATTENDANCE_STATUS_LABELS).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              onSearch("");
              setDate("");
              setEmployeeId("");
              setStatus("");
              setPage(1);
            }}
            className="min-h-11 self-end rounded-lg border border-border px-3 text-[12px] font-semibold text-text-secondary hover:bg-page"
          >
            Clear filters
          </button>
        </div>
        {resource.data && (
          <TeamAttendanceTable
            records={records.slice((current - 1) * 10, current * 10)}
            employees={employees}
            timeZone={resource.data.timeZone}
          />
        )}
        <DepartmentPagination
          page={current}
          total={records.length}
          onChange={setPage}
        />
      </section>
    </DepartmentPage>
  );
}
