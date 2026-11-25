import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { UserPlus } from "lucide-react";
import useDepartmentData from "../../hooks/department/useDepartmentData.js";
import { loadDepartmentTeam } from "../../services/department/departmentService.js";
import DepartmentPage from "../../components/department/DepartmentPage.jsx";
import DepartmentPagination from "../../components/department/DepartmentPagination.jsx";
import TeamTable from "../../components/department/TeamTable.jsx";

export default function MyTeam() {
  const resource = useDepartmentData(loadDepartmentTeam);
  const { search, onSearch } = useOutletContext();
  const [page, setPage] = useState(1);
  const query = search.trim().toLowerCase();
  const employees = (resource.data?.employees || []).filter((employee) =>
    [employee.fullName, employee.serialNumber, employee.email || ""].some(
      (value) => value.toLowerCase().includes(query),
    ),
  );
  const current = Math.min(page, Math.max(1, Math.ceil(employees.length / 10)));
  return (
    <DepartmentPage
      title="My Team"
      description="View your department's employees and add new team members. HR manages later record changes."
      resource={resource}
    >
      <div className="flex justify-end">
        <Link to="/department/team/add" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-[12px] font-semibold text-white hover:bg-primary-hover">
          <UserPlus size={17} />Add Employee
        </Link>
      </div>
      <section className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="p-5">
          <label
            htmlFor="team-search"
            className="mb-2 block text-[12px] font-semibold"
          >
            Search team
          </label>
          <input
            id="team-search"
            value={search}
            placeholder="Name, employee ID, or email"
            onChange={(event) => {
              onSearch(event.target.value);
              setPage(1);
            }}
            className="min-h-11 w-full max-w-xl rounded-lg border border-border px-3 text-[13px] outline-primary"
          />
        </div>
        <TeamTable
          employees={employees.slice((current - 1) * 10, current * 10)}
        />
        <DepartmentPagination
          page={current}
          total={employees.length}
          onChange={setPage}
        />
      </section>
    </DepartmentPage>
  );
}
