import '../models/mhoc_models.dart';

class MockDataEngine {
  static RiskSnapshot getMockRiskSnapshot() {
    return RiskSnapshot(
      userId: 'demo',
      timestamp: DateTime.now().toIso8601String(),
      igdScore: 78.5,
      bddScore: 42.0,
      stressScore: 65.0,
      sleepScore: 82.0,
      compositeScore: 68.2,
      riskTier: 'high',
      delta24h: 4.5,
    );
  }

  static List<BehavioralEvent> getMockEvents() {
    return [
      BehavioralEvent(
        id: '1',
        timestamp: DateTime.now().toIso8601String(),
        type: 'risk_score',
        severity: 'critical',
        description: 'Composite risk increased to CRITICAL based on sleep deficit + gaming.',
        acknowledged: false,
      ),
      BehavioralEvent(
        id: '2',
        timestamp: DateTime.now().subtract(const Duration(minutes: 45)).toIso8601String(),
        type: 'journal',
        severity: 'alert',
        description: '3 IGD + 2 BDD signals found in latest journal entry.',
        acknowledged: false,
      ),
      BehavioralEvent(
        id: '3',
        timestamp: DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
        type: 'sleep',
        severity: 'warning',
        description: 'Average sleep fell below 5h over 3-day trend.',
        acknowledged: true,
      ),
    ];
  }

  static List<TrendData> getMockTrendData() {
    return [
      TrendData(date: 'Mon', igdScore: 65, bddScore: 40, compositeScore: 58),
      TrendData(date: 'Tue', igdScore: 68, bddScore: 42, compositeScore: 61),
      TrendData(date: 'Wed', igdScore: 75, bddScore: 41, compositeScore: 66),
      TrendData(date: 'Thu', igdScore: 72, bddScore: 45, compositeScore: 64),
      TrendData(date: 'Fri', igdScore: 78, bddScore: 42, compositeScore: 68),
      TrendData(date: 'Sat', igdScore: 85, bddScore: 40, compositeScore: 73),
      TrendData(date: 'Sun', igdScore: 78, bddScore: 42, compositeScore: 68),
    ];
  }
}
