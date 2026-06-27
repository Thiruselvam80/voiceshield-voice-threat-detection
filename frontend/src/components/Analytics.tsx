import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, ShieldAlert, BrainCircuit, BarChart3 } from 'lucide-react';

interface AnalyticsProps {
  logs: any[];
}

export default function Analytics({ logs }: AnalyticsProps) {
  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    
    const riskCounts = { SAFE: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const emotionCounts: Record<string, number> = {};
    const threatCounts: Record<string, number> = {};

    logs.forEach(l => {
      if (l.risk in riskCounts) riskCounts[l.risk as keyof typeof riskCounts]++;
      emotionCounts[l.emotion] = (emotionCounts[l.emotion] || 0) + 1;
      threatCounts[l.threat] = (threatCounts[l.threat] || 0) + 1;
    });

    const riskData = Object.entries(riskCounts).map(([name, value]) => ({ name, value }));
    const emotionData = Object.entries(emotionCounts).map(([name, value]) => ({ name, value }));
    
    const threatDistribution = Object.entries(threatCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5 threats

    const timelineData = logs.slice().reverse().map((l, i) => ({
      index: i + 1,
      time: l.time,
      threatScore: l.threatConf * 100,
    }));

    return { riskData, emotionData, threatDistribution, timelineData };
  }, [logs]);

  // Colors mapping for Enterprise theme
  const RISK_COLORS: Record<string, string> = {
    SAFE: '#16A34A',
    LOW: '#3B82F6',
    MEDIUM: '#F59E0B',
    HIGH: '#DC2626',
    CRITICAL: '#991B1B',
  };
  
  const EMOTION_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-md shadow-md text-popover-foreground text-sm">
          <p className="font-medium mb-1">{label || payload[0].payload.name}</p>
          <p className="text-muted-foreground">
            {payload[0].name}: <span className="font-semibold text-foreground">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
          <p>No data available. Process some audio or text to generate analytics.</p>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = logs.filter(l => l.risk === 'CRITICAL' || l.risk === 'HIGH').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Incidents</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High/Critical Risk</CardTitle>
            <ShieldAlert className={`w-4 h-4 ${criticalCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalCount > 0 ? 'text-destructive' : ''}`}>
              {criticalCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Threat Type</CardTitle>
            <BrainCircuit className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {stats.threatDistribution.length > 0 ? stats.threatDistribution[0].name : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Emotion</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {stats.emotionData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#263041', opacity: 0.4 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emotion Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.emotionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Threat Confidence Timeline</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="threatScore" 
                  name="Threat %" 
                  stroke="#DC2626" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#DC2626', strokeWidth: 0 }} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
