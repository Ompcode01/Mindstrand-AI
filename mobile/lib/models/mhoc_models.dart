class RiskSnapshot {
  final String userId;
  final String timestamp;
  final double igdScore;
  final double bddScore;
  final double stressScore;
  final double sleepScore;
  final double compositeScore;
  final String riskTier; // 'low', 'moderate', 'high', 'critical'
  final double delta24h;

  RiskSnapshot({
    required this.userId,
    required this.timestamp,
    required this.igdScore,
    required this.bddScore,
    required this.stressScore,
    required this.sleepScore,
    required this.compositeScore,
    required this.riskTier,
    required this.delta24h,
  });
}

class BehavioralEvent {
  final String id;
  final String timestamp;
  final String type; // 'risk_score', 'journal', 'telemetry', 'checkin'
  final String severity; // 'info', 'warning', 'alert', 'critical'
  final String description;
  final bool acknowledged;

  BehavioralEvent({
    required this.id,
    required this.timestamp,
    required this.type,
    required this.severity,
    required this.description,
    required this.acknowledged,
  });
}

class TrendData {
  final String date;
  final double igdScore;
  final double bddScore;
  final double compositeScore;

  TrendData({
    required this.date,
    required this.igdScore,
    required this.bddScore,
    required this.compositeScore,
  });
}
