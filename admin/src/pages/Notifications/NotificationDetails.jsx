import { useState } from "react";
import Modal, { ModalActions } from "../../components/common/Modal.jsx";
import ConfirmationModal from "../../components/common/ConfirmationModal.jsx";
import Button from "../../components/common/Button.jsx";
import ApplicantProfileModal from "../../components/recruitment/ApplicantProfileModal.jsx";
import LeaveActionModal from "../../components/leave/LeaveActionModal.jsx";
import { applicationRows } from "../../services/recruitment/recruitmentService.js";
import { announcementAudienceLabel } from "../../services/communications/announcementService.js";
import {
  buildLeaveRows,
  getLeaveApprovalError,
} from "../../services/operations/leaveService.js";
import { careerRows } from "../../services/growth/careerService.js";
import formatDate from "../../utils/formatters/formatDate.js";
import formatCurrency from "../../utils/formatters/formatCurrency.js";
import { formatTimestamp } from "../../utils/formatters/formatTime.js";

function DetailsFrame({
  record,
  title,
  subtitle,
  fields = [],
  onClose,
  actions,
  children,
}) {
  return (
    <Modal
      title={record ? title : "Record unavailable"}
      subtitle={record ? subtitle : undefined}
      size="medium"
      onClose={onClose}
    >
      {record ? (
        <>
          <dl className="tw:grid tw:grid-cols-2 tw:gap-[20px] tw:m-0 tw:max-[640px]:grid-cols-1 tw:[&_dt]:text-[11px] tw:[&_dt]:text-[var(--text-muted)] tw:[&_dd]:m-0 tw:[&_dd]:mt-[6px] tw:[&_dd]:text-[13px] tw:[&_dd]:text-text-secondary tw:[&_dd]:leading-[1.7] tw:[&_dd]:[overflow-wrap:anywhere]">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value ?? "Not recorded"}</dd>
              </div>
            ))}
          </dl>
          {children}
        </>
      ) : (
        <p className="tw:text-[13px] tw:text-text-secondary tw:leading-[1.8]">
          This record was removed or is no longer available. Other records in
          this section are still shown.
        </p>
      )}
      <ModalActions className="tw:flex-wrap">
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
        {record && actions}
      </ModalActions>
    </Modal>
  );
}

function DetailsText({ label, children, review = false }) {
  return (
    <section className="tw:mt-[22px]">
      <h3 className="tw:text-[12px] tw:font-semibold tw:text-text-primary">
        {label}
      </h3>
      <p
        className={`tw:mt-[7px] tw:text-[13px] tw:leading-[1.9] tw:whitespace-pre-wrap tw:[overflow-wrap:anywhere] ${review ? "tw:text-[#a64b0a]" : "tw:text-text-secondary"}`}
      >
        {children}
      </p>
    </section>
  );
}

function AnnouncementDetails({
  recordId,
  announcements,
  onClose,
  onDelete,
  busy,
}) {
  const record = announcements.find((item) => String(item.id) === recordId);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  if (confirming && record)
    return (
      <ConfirmationModal
        title="Delete announcement?"
        confirmLabel="Delete Announcement"
        destructive
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          if (busy) return;
          try {
            onDelete(record.id);
            onClose();
          } catch (failure) {
            setError(
              failure.message || "The announcement could not be deleted.",
            );
          }
        }}
      >
        <p>
          Delete <strong>{record.title}</strong>? This removes this notice from
          the announcement list.
        </p>
        {error && (
          <p role="alert" className="tw:mt-[14px] tw:text-[#b33450]">
            {error}
          </p>
        )}
      </ConfirmationModal>
    );
  return (
    <DetailsFrame
      record={record}
      title={record?.title}
      subtitle="Announcement details"
      onClose={onClose}
      fields={
        record
          ? [
              ["Announcement ID", record.id],
              [
                "Target audience",
                announcementAudienceLabel(record.targetAudience),
              ],
              ["Posted by", record.postedBy],
              ["Posted date", formatDate(record.date)],
            ]
          : []
      }
      actions={
        <Button
          type="button"
          variant="danger-outline"
          disabled={busy}
          onClick={() => {
            setConfirming(true);
            setError("");
          }}
        >
          Delete announcement
        </Button>
      }
    >
      <DetailsText label="Message">{record?.content}</DetailsText>
    </DetailsFrame>
  );
}

function ApplicationDetails({
  recordId,
  recruitment,
  departments,
  onClose,
  onDecide,
  busy,
}) {
  // Resolve by application ID, independently of the list's search or vacancy filter.
  const record = applicationRows(recruitment, departments).find(
    (item) => String(item.id) === recordId,
  );
  const [decision, setDecision] = useState("");
  const [error, setError] = useState("");
  if (!record) return <DetailsFrame onClose={onClose} />;
  if (decision)
    return (
      <ConfirmationModal
        title={
          decision === "SHORTLISTED"
            ? "Shortlist Candidate for Interview?"
            : "Reject Application?"
        }
        confirmLabel={
          decision === "SHORTLISTED"
            ? "Shortlist for Interview"
            : "Reject Application"
        }
        onCancel={() => setDecision("")}
        onConfirm={() => {
          if (busy) return;
          try {
            onDecide(record.id, decision);
            onClose();
          } catch (failure) {
            setError(failure.message || "The decision could not be saved.");
          }
        }}
      >
        <p>
          {decision === "SHORTLISTED" ? "Shortlist" : "Reject"}{" "}
          <strong>{record.fullName}</strong> for{" "}
          <strong>{record.jobTitle}</strong>?
        </p>
        {decision === "SHORTLISTED" && (
          <p>
            Arrange the interview separately. Shortlisting does not confirm
            employment or send an invitation.
          </p>
        )}
        {error && (
          <p role="alert" className="tw:mt-[14px] tw:text-[#b33450]">
            {error}
          </p>
        )}
      </ConfirmationModal>
    );
  return (
    <ApplicantProfileModal
      application={record}
      onClose={onClose}
      actions={
        ["PENDING", "SHORTLISTED"].includes(record.status) && (
          <>
            {record.status === "PENDING" && (
              <Button
                type="button"
                disabled={busy}
                onClick={() => {
                  setDecision("SHORTLISTED");
                  setError("");
                }}
              >
                Shortlist for interview
              </Button>
            )}
            <Button
              type="button"
              variant="danger-outline"
              disabled={busy}
              onClick={() => {
                setDecision("REJECTED");
                setError("");
              }}
            >
              Reject application
            </Button>
          </>
        )
      }
    />
  );
}

function LeaveDetails({
  recordId,
  leaveData,
  employees,
  loading,
  error,
  onRetry,
  onClose,
  onDecide,
  onDirtyChange,
  busy,
}) {
  const [decision, setDecision] = useState("");
  if (!leaveData)
    return (
      <Modal
        title={loading ? "Loading leave request…" : "Leave request unavailable"}
        size="small"
        onClose={onClose}
      >
        <p
          className="tw:text-[13px] tw:text-text-secondary tw:leading-[1.8]"
          role={error ? "alert" : "status"}
        >
          {error || "Waiting for leave records to load."}
        </p>
        <ModalActions>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          {!loading && (
            <Button type="button" onClick={onRetry} disabled={busy}>
              Retry
            </Button>
          )}
        </ModalActions>
      </Modal>
    );
  const record = buildLeaveRows(
    leaveData.requests,
    leaveData.balances,
    employees,
  ).find((item) => String(item.id) === recordId);
  if (record && decision)
    return (
      <LeaveActionModal
        key={decision}
        request={record}
        status={decision}
        settings={leaveData.settings}
        approvalError={getLeaveApprovalError(
          record,
          record.balance,
          leaveData.requests,
          employees,
          leaveData.settings,
        )}
        onDecide={onDecide}
        onDirtyChange={onDirtyChange}
        onClose={() => {
          onDirtyChange(false);
          onClose();
        }}
      />
    );
  return (
    <DetailsFrame
      record={record}
      title="Leave request details"
      subtitle={record ? `${record.name} · ${record.id}` : ""}
      onClose={onClose}
      fields={
        record
          ? [
              ["Employee", record.name],
              ["Employee ID", record.employeeId],
              ["Department", record.department],
              ["Status", record.status],
              ["Start date", formatDate(record.startDate)],
              ["End date", formatDate(record.endDate)],
              ["Days requested", record.daysRequested],
              [
                "Day counting",
                record.dayCounting === "weekdays"
                  ? "Monday–Friday"
                  : record.dayCounting === "calendar"
                    ? "Calendar days"
                    : "Not recorded",
              ],
              ["Current accrued days", record.balance?.accrued],
              ["Current used days", record.balance?.used],
              ["Current remaining days", record.balance?.remaining],
            ]
          : []
      }
      actions={
        record?.status === "PENDING" && (
          <>
            <Button
              type="button"
              variant="danger-outline"
              disabled={busy}
              onClick={() => setDecision("REJECTED")}
            >
              Reject request
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => setDecision("APPROVED")}
            >
              Approve request
            </Button>
          </>
        )
      }
    >
      <DetailsText label="Reason">
        {record?.reason || "No reason provided."}
      </DetailsText>
      {record?.decisionNote && (
        <DetailsText label="HR decision note">
          {record.decisionNote}
        </DetailsText>
      )}
      {!!record?.history?.length && (
        <section className="tw:mt-[22px]">
          <h3 className="tw:text-[12px] tw:font-semibold">Request history</h3>
          <ol className="tw:m-0 tw:mt-[10px] tw:pl-[20px] tw:max-h-[220px] tw:overflow-y-auto">
            {record.history.map((entry, index) => (
              <li
                key={`${entry.at}:${index}`}
                className="tw:py-[8px] tw:text-[12px] tw:text-text-secondary tw:leading-[1.8] tw:[overflow-wrap:anywhere]"
              >
                <strong>
                  {entry.action}
                  {entry.previousStatus ? ` (was ${entry.previousStatus})` : ""}
                </strong>
                <p className="tw:text-[11px] tw:text-[var(--text-muted)]">
                  {formatTimestamp(entry.at)}
                </p>
                {entry.note && (
                  <p className="tw:whitespace-pre-wrap">{entry.note}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </DetailsFrame>
  );
}

function CareerDetails({
  recordId,
  milestones,
  employees,
  onClose,
  onCancel,
  busy,
}) {
  const record = careerRows(milestones, employees).find(
    (item) => String(item.id) === recordId,
  );
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  if (confirming && record)
    return (
      <ConfirmationModal
        title="Cancel scheduled change?"
        confirmLabel="Cancel plan"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          if (busy) return;
          try {
            onCancel(record.id);
            onClose();
          } catch (failure) {
            setError(failure.message || "The plan could not be cancelled.");
          }
        }}
      >
        <p>
          Cancel this change for <strong>{record.employeeName}</strong>? The
          record remains in history and their current grade and salary stay
          unchanged.
        </p>
        {error && (
          <p role="alert" className="tw:mt-[14px] tw:text-[#b33450]">
            {error}
          </p>
        )}
      </ConfirmationModal>
    );
  return (
    <DetailsFrame
      record={record}
      title="Career change details"
      subtitle={record?.employeeName}
      onClose={onClose}
      fields={
        record
          ? [
              ["Milestone ID", record.id],
              ["Employee ID", record.employeeId],
              ["Milestone type", record.typeLabel],
              ["Status", record.status.replaceAll("_", " ")],
              ["Effective date", formatDate(record.effectiveDate)],
              ["Previous grade", record.previousGradeName || "Not recorded"],
              ["New grade", record.newGradeName || "Unchanged"],
              [
                "Previous salary",
                record.previousSalary == null
                  ? "Not recorded"
                  : formatCurrency(record.previousSalary),
              ],
              [
                "New salary",
                record.newSalary == null
                  ? "Unchanged"
                  : formatCurrency(record.newSalary),
              ],
              [
                "Expected employee grade",
                record.expectedEmployeeGrade || "Not recorded",
              ],
              [
                "Expected employee salary",
                record.expectedEmployeeSalary == null
                  ? "Not recorded"
                  : formatCurrency(record.expectedEmployeeSalary),
              ],
            ]
          : []
      }
      actions={
        ["SCHEDULED", "NEEDS_REVIEW"].includes(record?.status) && (
          <Button
            type="button"
            variant="danger-outline"
            disabled={busy}
            onClick={() => {
              setConfirming(true);
              setError("");
            }}
          >
            Cancel plan
          </Button>
        )
      }
    >
      <DetailsText label="Description">
        {record?.description || "No description provided."}
      </DetailsText>
      {record?.reviewReason && (
        <DetailsText label="Review required" review>
          {record.reviewReason}
        </DetailsText>
      )}
    </DetailsFrame>
  );
}

// Detail routes resolve the current source record, even after its notification
// leaves the inbox. A missing source never opens another person's record.
export default function NotificationDetails({
  route,
  announcements,
  recruitment,
  departments,
  leaveData,
  leaveLoading,
  leaveError,
  onRetryLeave,
  milestones,
  employees,
  busy,
  onClose,
  onDirtyChange,
  onDeleteAnnouncement,
  onDecideApplication,
  onDecideLeave,
  onCancelCareer,
}) {
  const common = { recordId: route.recordId, onClose, busy };
  if (route.page === "announcements")
    return (
      <AnnouncementDetails
        {...common}
        announcements={announcements}
        onDelete={onDeleteAnnouncement}
      />
    );
  if (route.page === "applicants")
    return (
      <ApplicationDetails
        {...common}
        recruitment={recruitment}
        departments={departments}
        onDecide={onDecideApplication}
      />
    );
  if (route.page === "leave")
    return (
      <LeaveDetails
        {...common}
        leaveData={leaveData}
        employees={employees}
        loading={leaveLoading}
        error={leaveError}
        onRetry={onRetryLeave}
        onDecide={onDecideLeave}
        onDirtyChange={onDirtyChange}
      />
    );
  if (route.page === "career")
    return (
      <CareerDetails
        {...common}
        milestones={milestones}
        employees={employees}
        onCancel={onCancelCareer}
      />
    );
  return <DetailsFrame onClose={onClose} />;
}
