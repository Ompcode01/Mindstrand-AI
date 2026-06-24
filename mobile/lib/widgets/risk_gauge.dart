import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';

class RiskGauge extends StatelessWidget {
  final String dimension;
  final double score;
  final String tier;

  const RiskGauge({
    super.key,
    required this.dimension,
    required this.score,
    required this.tier,
  });

  Color _getTierColor() {
    switch (tier.toLowerCase()) {
      case 'low': return AppTheme.accent;
      case 'moderate': return AppTheme.warning;
      case 'high': return AppTheme.primary;
      case 'critical': return AppTheme.critical;
      default: return AppTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getTierColor();
    
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(LucideIcons.activity, color: color, size: 14),
            const SizedBox(width: 4),
            Text(
              dimension,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(fontSize: 10, color: color),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 70,
              height: 70,
              child: CircularProgressIndicator(
                value: score / 100,
                strokeWidth: 6,
                backgroundColor: Colors.white.withOpacity(0.05),
                color: color,
                strokeCap: StrokeCap.round,
              ),
            ),
            Text(
              score.toStringAsFixed(1),
              style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 18),
            ),
          ],
        ),
      ],
    );
  }
}
