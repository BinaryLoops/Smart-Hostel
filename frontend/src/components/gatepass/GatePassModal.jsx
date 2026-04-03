import { useMemo } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Modal } from '../ui/Modal'

export function GatePassModal({ open, onClose, studentId, roomNumber, timeOut }) {
  const payload = useMemo(() => {
    return JSON.stringify({
      studentId,
      roomNumber,
      timeOut,
      type: 'outing_gate_pass',
    })
  }, [roomNumber, studentId, timeOut])

  return (
    <Modal open={open} title="QR Gate Pass" onClose={onClose}>
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-4">
          <QRCodeCanvas value={payload} size={220} includeMargin />
        </div>
        <div className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--text-primary)]">Student</span>
            <span className="font-mono">{studentId}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--text-primary)]">Room</span>
            <span className="font-mono">{roomNumber}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-medium text-[var(--text-primary)]">Time out</span>
            <span className="font-mono">{new Date(timeOut).toLocaleString()}</span>
          </div>
        </div>
        <p className="text-center text-xs text-[var(--text-secondary)]">
          Show this QR at the gate. It encodes your student id, room number, and time-out.
        </p>
      </div>
    </Modal>
  )
}

