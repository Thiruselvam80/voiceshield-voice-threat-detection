import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Filter } from 'lucide-react';

interface IncidentLogProps {
  logs: any[];
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
}

const RISK_FILTERS = ['ALL', 'SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function IncidentLog({ logs, setLogs }: IncidentLogProps) {
  const [filter, setFilter] = useState('ALL');

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.risk === filter);

  function exportJSON(logsData: any[]) {
    const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceshield_incidents_${Date.now()}.json`;
    a.click();
  }

  function exportCSV(logsData: any[]) {
    const header = 'Time,Filename,Transcript,Emotion,EmotionConf,Threat,ThreatConf,Risk\n';
    const rows = logsData.map(l =>
      `"${l.time}","${l.filename}","${(l.transcript || '').replace(/"/g, '""')}","${l.emotion}",${(l.emotionConf * 100).toFixed(1)},"${l.threat}",${(l.threatConf * 100).toFixed(1)},"${l.risk}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceshield_incidents_${Date.now()}.csv`;
    a.click();
  }

  const getRiskBadgeVariant = (risk: string) => {
    switch(risk) {
      case 'SAFE': return 'success';
      case 'LOW': return 'default';
      case 'MEDIUM': return 'warning';
      case 'HIGH':
      case 'CRITICAL': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2">
          <CardTitle>Incident Log</CardTitle>
          <Badge variant="secondary">{filteredLogs.length}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-secondary rounded-md p-1 mr-2">
            <Filter className="w-4 h-4 text-muted-foreground ml-2 mr-1" />
            {RISK_FILTERS.map(r => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                  filter === r 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {logs.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => exportCSV(filteredLogs)}>
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportJSON(filteredLogs)}>
                <Download className="w-4 h-4 mr-2" /> JSON
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setLogs([])}>
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No incidents found for the selected filter.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Emotion</TableHead>
                <TableHead>Threat</TableHead>
                <TableHead>Transcript</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log, idx) => (
                <TableRow key={idx}>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">{log.time}</TableCell>
                  <TableCell className="font-medium max-w-[150px] truncate" title={log.filename}>
                    {log.filename}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(log.risk) as any}>{log.risk}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{log.emotion}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {(log.emotionConf * 100).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{log.threat}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {(log.threatConf * 100).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground" title={log.transcript}>
                    {log.transcript}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
