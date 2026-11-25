import { Link } from 'react-router-dom'

export default function TeamTable({ employees }) {
  return <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Department employee table">
    <table className="w-full min-w-[680px] border-collapse text-left text-[12px] [&_th]:bg-[#f6f9fb] [&_th]:p-4 [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted [&_td]:border-t [&_td]:border-border [&_td]:p-4 [&_td]:text-text-secondary">
      <caption className="sr-only">Employees in your assigned department</caption>
      <thead><tr>{['Employee', 'Registered email', 'Portal role', 'Employment status', 'Attendance'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{employees.map(employee => <tr key={employee.id} className="hover:bg-[#f9fcfb]">
        <td><strong className="block font-semibold text-text-primary">{employee.fullName}</strong><small className="mt-1 block text-muted">{employee.serialNumber}</small></td>
        <td>{employee.email || 'Not provided'}</td>
        <td>{employee.role === 'DEPARTMENT_HEAD' ? 'Head of Department' : employee.role === 'HR_MANAGER' ? 'HR Manager' : 'Employee'}</td>
        <td className="capitalize">{employee.employmentStatus.toLowerCase().replaceAll('_', ' ')}</td>
        <td><Link to="/department/attendance" className="font-semibold text-primary hover:underline">View attendance</Link></td>
      </tr>)}</tbody>
    </table>
    {!employees.length && <p className="p-6 text-[13px] text-muted">No team members match your search.</p>}
  </div>
}
