import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ScanFace, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const MOCK_SCANS = [
  { studentId: 'student1@vit.ac.in', studentName: 'John Doe', studentBlock: 'A', studentGender: 'Male', scannedAtBlock: 'A', desc: 'Valid Entry (Same Block)' },
  { studentId: 'student2@vit.ac.in', studentName: 'Priya Sharma', studentBlock: 'B', studentGender: 'Female', scannedAtBlock: 'B', desc: 'Valid Entry (Same Block)' },
  { studentId: 'student3@vit.ac.in', studentName: 'Rahul Kumar', studentBlock: 'D1', studentGender: 'Male', scannedAtBlock: 'D1', desc: 'Valid Entry (Same Block)' },
  { studentId: 'student4@vit.ac.in', studentName: 'Arjun Singh', studentBlock: 'D2', studentGender: 'Male', scannedAtBlock: 'A', desc: 'Cross-Hostel (Male to Male)' },
  { studentId: 'student5@vit.ac.in', studentName: 'Sneha Gupta', studentBlock: 'B', studentGender: 'Female', scannedAtBlock: 'C-Girls', desc: 'Cross-Hostel (Female to Female)' },
  { studentId: 'student6@vit.ac.in', studentName: 'Vikram Desai', studentBlock: 'A', studentGender: 'Male', scannedAtBlock: 'B', desc: 'CODE RED: Male in Girls Block' },
  { studentId: 'student7@vit.ac.in', studentName: 'Riya Mehra', studentBlock: 'C-Girls', studentGender: 'Female', scannedAtBlock: 'E', desc: 'CODE RED: Female in Boys Block' },
]

export function ScannerSimulator() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  async function triggerSimulatedScans() {
    setIsProcessing(true)
    const results = []
    
    // Simulate real-time scanning with visual delay
    for (let i = 0; i < MOCK_SCANS.length; i++) {
      const scan = MOCK_SCANS[i]
      // randomize scan time slightly within the last 10 minutes
      const scanTime = new Date(Date.now() - Math.floor(Math.random() * 600000)).toISOString()

      try {
        const payload = {
          ...scan,
          time: scanTime
        }
        
        // This makes a raw fetch because our API wrapper might expect Auth. 
        // We bypass standard api wrapper to act as an external hardware scanner.
        const res = await fetch('/api/entry-exit/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        const data = await res.json()
        results.push({ ...scan, time: scanTime, isRedAlert: data.isRedAlert, alertReason: data.alertReason })
      } catch (err) {
        results.push({ ...scan, time: scanTime, error: true })
      }
      
      // Artificial delay for UI scanning effect
      await new Promise(r => setTimeout(r, 600))
      setLogs([...results])
    }
    
    setIsProcessing(false)
  }

  return (
    <div>
      <PageHeader
        title="Hardware Scanner Demo"
        description="Simulates physical facial recognition scanners at hostel gates pushing latency-free HTTP POST actions to the Smart Hostel API."
        action={
          <Button onClick={triggerSimulatedScans} disabled={isProcessing}>
            <ScanFace className="mr-2 h-4 w-4" />
            {isProcessing ? 'Scanning Hardware...' : 'Trigger 7 Test Scans'}
          </Button>
        }
      />

      <div className="grid gap-6">
        {logs.length === 0 && !isProcessing && (
          <Card className="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
            <ScanFace className="mb-4 h-12 w-12 opacity-50" />
            <p>Ready to simulate hardware. Click the top button to generate hardware events.</p>
          </Card>
        )}

        {logs.map((log, idx) => (
          <Card 
            key={idx} 
            className={`flex items-center gap-4 p-4 ${log.isRedAlert ? 'border border-[var(--danger)]/50 bg-[var(--danger)]/5' : ''}`}
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${log.isRedAlert ? 'bg-[var(--danger)]/20 text-[var(--danger)]' : 'bg-[var(--chart-1)]/20 text-[var(--chart-1)]'}`}>
              {log.isRedAlert ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)]">{log.studentName}</h3>
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  {new Date(log.time).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="mt-1 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span>Own Block: <strong>{log.studentBlock}</strong> ({log.studentGender})</span>
                <span>→</span>
                <span>Scanned At: <strong>{log.scannedAtBlock}</strong></span>
              </div>

              {log.isRedAlert && (
                <p className="mt-2 text-sm font-semibold text-[var(--danger)]">{log.alertReason}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
