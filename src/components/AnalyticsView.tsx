import { useAppState } from '../context/AppStateContext';
import {
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  History,
  Activity,
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsView() {
  const {
    topics,
    questions,
    practiceSessions,
    mockTests,
    errorBook
  } = useAppState();

  // 1. Practice Heatmap (Last 12 weeks activity map)
  const getHeatmapData = () => {
    const dates: Record<string, number> = {};
    practiceSessions.forEach(s => {
      const day = s.date.split('T')[0];
      dates[day] = (dates[day] || 0) + s.totalQuestions;
    });

    const weeks = 12;
    const today = new Date();
    const result: { date: string; count: number; dayOfWeek: number; weekIdx: number; displayDate: string }[] = [];

    // Form 12 weeks of days starting from Sunday 12 weeks ago
    const startDay = new Date();
    startDay.setDate(today.getDate() - (weeks * 7) + 1);

    for (let i = 0; i < weeks * 7; i++) {
      const curr = new Date(startDay);
      curr.setDate(startDay.getDate() + i);
      const str = curr.toISOString().split('T')[0];
      const count = dates[str] || 0;

      result.push({
        date: str,
        count,
        dayOfWeek: curr.getDay(),
        weekIdx: Math.floor(i / 7),
        displayDate: (() => {
          const dd = String(curr.getDate()).padStart(2, '0');
          const mm = String(curr.getMonth() + 1).padStart(2, '0');
          const yyyy = curr.getFullYear();
          return `${dd}-${mm}-${yyyy}`;
        })()
      });
    }
    return { heatmapDays: result, weeksCount: weeks };
  };

  const { heatmapDays, weeksCount } = getHeatmapData();

  // Average Mock Score Ratio
  const getAverageMockScore = () => {
    if (mockTests.length === 0) return 0;
    const sum = mockTests.reduce((acc, m) => acc + (m.score / m.totalScore) * 100, 0);
    return Math.round(sum / mockTests.length);
  };
  const averageMockScore = getAverageMockScore();

  // Average Practice accuracy
  const calculateOverallAccuracy = () => {
    if (practiceSessions.length === 0) return 0;
    const totalCorrect = practiceSessions.reduce((acc, s) => {
      return acc + s.results.filter(r => r.isCorrect).length;
    }, 0);
    const totalAnswered = practiceSessions.reduce((acc, s) => {
      return acc + s.results.length;
    }, 0);
    return totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  };
  const overallAccuracy = calculateOverallAccuracy();

  // Mock Performance Trend
  const mockTrendData = [...mockTests]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(m => ({
      name: m.name.length > 20 ? m.name.substring(0, 18) + '...' : m.name,
      scorePercent: Math.round((m.score / m.totalScore) * 100),
      rawScore: `${m.score}/${m.totalScore}`,
      accuracy: m.accuracy
    }));

  // Topic-wise accuracy & mastery comparison data
  const topicData = topics.map(t => {
    // Mastery
    let conceptMasterySum = 0;
    let conceptCount = 0;
    let totalQuestionsInTopic = 0;

    t.subtopics.forEach(st => {
      st.concepts.forEach(c => {
        conceptMasterySum += c.mastery;
        conceptCount++;
        totalQuestionsInTopic += c.questionsCount;
      });
    });

    const avgMastery = conceptCount > 0 ? Math.round(conceptMasterySum / conceptCount) : 0;

    // Accuracy from practice sessions
    const results = practiceSessions.flatMap(ps => ps.results).filter(res => {
      const q = questions.find(qu => qu.id === res.questionId);
      if (!q) return false;
      const concept = t.subtopics.flatMap(st => st.concepts).find(c => c.id === q.conceptId);
      return !!concept;
    });

    const correct = results.filter(r => r.isCorrect).length;
    const answered = results.length;
    const avgAccuracy = answered > 0 ? Math.round((correct / answered) * 100) : avgMastery; // Fallback to mastery if unpracticed

    return {
      name: t.name,
      'Syllabus Mastery (%)': avgMastery,
      'Practice Accuracy (%)': avgAccuracy,
      questionsCount: totalQuestionsInTopic
    };
  });

  // Weakest 5 Subtopics
  const getWeakestSubtopics = () => {
    const list: { subtopicName: string; topicName: string; mastery: number; conceptsCount: number }[] = [];
    topics.forEach(t => {
      t.subtopics.forEach(st => {
        let sum = 0;
        st.concepts.forEach(c => { sum += c.mastery; });
        const avgMastery = st.concepts.length > 0 ? Math.round(sum / st.concepts.length) : 0;
        list.push({
          subtopicName: st.name,
          topicName: t.name,
          mastery: avgMastery,
          conceptsCount: st.concepts.length
        });
      });
    });
    return list.sort((a, b) => a.mastery - b.mastery).slice(0, 5);
  };
  const weakestSubtopics = getWeakestSubtopics();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-white">
          Detailed Diagnostics
        </h2>
        <p className="text-slate-400 text-sm">
          Deep diagnostic metrics analyzing mock trends, topic-wise gaps, and cognitive failure vectors.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Mock Score Avg</span>
            <span className="text-lg font-bold text-slate-100 mt-0.5 block font-mono">{averageMockScore}%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Overall Accuracy</span>
            <span className="text-lg font-bold text-slate-100 mt-0.5 block font-mono">{overallAccuracy}%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Doubt Book size</span>
            <span className="text-lg font-bold text-slate-100 mt-0.5 block font-mono">
              {errorBook.filter(e => !e.archived).length} doubts
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Total Practices</span>
            <span className="text-lg font-bold text-slate-100 mt-0.5 block font-mono">{practiceSessions.length} sets</span>
          </div>
        </div>
      </div>

      {/* Row 2: Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-white text-sm tracking-tight flex items-center gap-2">
            <Calendar size={15} className="text-indigo-400" />
            Anki-Inspired Practice consistency grid
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">Shading indicates daily counts of answered practice questions.</p>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 justify-start items-start min-w-[600px] py-1">
            {/* Weekday indicators */}
            <div className="grid grid-rows-7 gap-1.5 text-[9px] font-mono text-slate-500 pt-1 text-right pr-2 shrink-0 select-none">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Calendar grid of 12 weeks */}
            <div className="grid grid-cols-12 gap-1.5 flex-1">
              {Array.from({ length: weeksCount }).map((_, weekIdx) => {
                const weekDays = heatmapDays.filter(d => d.weekIdx === weekIdx);
                return (
                  <div key={weekIdx} className="grid grid-rows-7 gap-1.5 shrink-0">
                    {weekDays.map(day => {
                      const hasPractice = day.count > 0;
                      return (
                        <div
                          key={day.date}
                          title={`${day.displayDate}: ${day.count} questions practiced`}
                          className={`w-3.5 h-3.5 rounded-sm border transition-colors cursor-pointer ${
                            day.count >= 15 ? 'bg-indigo-600 border-indigo-500 shadow shadow-indigo-600/30' :
                            day.count >= 8 ? 'bg-indigo-700/60 border-indigo-750' :
                            day.count >= 1 ? 'bg-indigo-900/30 border-indigo-900/50' :
                            'bg-slate-950 border-slate-900/80 hover:border-slate-800'
                          }`}
                        ></div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 select-none pt-1">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-950 border border-slate-900"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-900/30 border border-indigo-900/50"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-700/60 border border-indigo-750"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 border border-indigo-500"></div>
          </div>
          <span>More practice</span>
        </div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Detailed Mock trends */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">Mock Paper Scores & Accuracy Ratio</h3>
          <div className="h-64 w-full bg-slate-950 rounded-xl p-3 border border-slate-900/80">
            {mockTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">No mock records available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line
                    type="monotone"
                    name="Score Percentage"
                    dataKey="scorePercent"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    name="Accuracy Ratio (%)"
                    dataKey="accuracy"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Topic-wise comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">Syllabus Mastery vs Practice Accuracy</h3>
          <div className="h-64 w-full bg-slate-950 rounded-xl p-3 border border-slate-900/80">
            {topicData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">No syllabus data compiled.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                    labelStyle={{ color: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    itemStyle={{ fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Syllabus Mastery (%)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Practice Accuracy (%)" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Row 4: Weakest syllabus subtopics table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <AlertTriangle size={15} className="text-rose-400" />
          Weakest Syllabus Subtopics Gaps (Immediate Attention Required)
        </h3>
        
        {weakestSubtopics.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-500 font-mono">No syllabus data logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="text-[10px] font-mono text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-3 pr-2">Subtopic</th>
                  <th className="pb-3 pr-2">Topic</th>
                  <th className="pb-3 pr-2 text-center">Concepts</th>
                  <th className="pb-3 text-right">Mastery Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {weakestSubtopics.map((st, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-950/20">
                      <td className="py-3 font-semibold text-slate-200 pr-2">{st.subtopicName}</td>
                      <td className="py-3 text-slate-400 pr-2">{st.topicName}</td>
                      <td className="py-3 text-center font-mono text-slate-500 pr-2">{st.conceptsCount}</td>
                      <td className="py-3 text-right">
                        <span className={`font-mono font-bold ${
                          st.mastery < 50 ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {st.mastery}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
