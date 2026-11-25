import { useNavigate, useOutletContext } from 'react-router-dom'
import useDepartmentData from '../../hooks/department/useDepartmentData.js'
import useCreateDepartmentEmployee from '../../hooks/department/useCreateDepartmentEmployee.js'
import { loadDepartmentEmployeeOptions } from '../../services/department/departmentService.js'
import { useEmployeeStore } from '../../store/index.js'
import DepartmentEmployeeForm from '../../components/department/DepartmentEmployeeForm.jsx'

export default function AddTeamEmployee() {
  const resource = useDepartmentData(loadDepartmentEmployeeOptions)
  const save = useCreateDepartmentEmployee(resource.data)
  const navigate = useNavigate()
  const { onNavigate, onSearch } = useOutletContext()
  const userId = useEmployeeStore(state => state.user?.id)
  const setNotice = useEmployeeStore(state => state.setNotice)
  function cancel(event) {
    onNavigate(event, '/department/team')
    if (!event.defaultPrevented) navigate('/department/team')
  }
  async function submit(values, key) {
    const employee = await save(values, key)
    setNotice(employee.fullName + ' was added to ' + resource.data.department.name + '.')
    onSearch('')
    navigate('/department/team')
  }
  if (!resource.data) return <section className="rounded-xl border border-border bg-white p-6">
    <h1 className="text-[27px] font-semibold">Add New Department Employee</h1>
    {resource.error ? <><p role="alert" className="my-4 text-[#b42344]">{resource.error}</p><button onClick={resource.refresh} className="rounded-lg bg-primary px-4 py-3 text-white">Try again</button></> : <p role="status" className="mt-4 text-text-secondary">Loading employee form…</p>}
  </section>
  if (!resource.data.canCreateEmployee || !resource.data.grades.length) return <section className="rounded-xl border border-border bg-white p-6">
    <h1 className="text-[27px] font-semibold">Add New Department Employee</h1>
    <p role="status" className="my-4 text-text-secondary">{resource.data.message || 'HR must configure available job grades before you can register employees.'}</p>
    <button onClick={cancel} className="rounded-lg border border-border px-4 py-3 text-primary">Back to My Team</button>
  </section>
  return <DepartmentEmployeeForm key={userId + ':' + resource.data.department.id} options={resource.data} onSave={submit} onCancel={cancel} />
}
