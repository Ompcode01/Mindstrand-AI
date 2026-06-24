import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../core/theme.dart';
import '../core/mock_data.dart';
import '../widgets/glass_panel.dart';
import '../widgets/risk_gauge.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  final snapshot = MockDataEngine.getMockRiskSnapshot();
  final events = MockDataEngine.getMockEvents();

  Widget _buildTopKPIs() {
    return SizedBox(
      height: 140,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          GlassPanel(
            width: 120,
            child: RiskGauge(dimension: "COMPOSITE", score: snapshot.compositeScore, tier: snapshot.riskTier),
          ),
          const SizedBox(width: 12),
          GlassPanel(
            width: 120,
            child: RiskGauge(dimension: "GAMING", score: snapshot.igdScore, tier: "high"),
          ),
          const SizedBox(width: 12),
          GlassPanel(
            width: 120,
            child: RiskGauge(dimension: "SLEEP", score: snapshot.sleepScore, tier: "moderate"),
          ),
        ],
      ),
    );
  }

  Widget _buildIntelligenceTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text("Weekly Trends", style: Theme.of(context).textTheme.labelMedium),
        const SizedBox(height: 16),
        GlassPanel(
          height: 200,
          child: Center(
            child: Text("fl_chart implementation goes here", style: Theme.of(context).textTheme.bodyMedium),
          ),
        ),
        const SizedBox(height: 24),
        Text("AI Insights", style: Theme.of(context).textTheme.labelMedium),
        const SizedBox(height: 16),
        GlassPanel(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.sparkles, color: AppTheme.accent, size: 16),
                  const SizedBox(width: 8),
                  Text("GEMINI 2.0 ANALYSIS", style: Theme.of(context).textTheme.labelMedium?.copyWith(color: AppTheme.accent)),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                "Your gaming sessions have increased by 15% this week, directly correlating with a drop in nightly HRV.",
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.5),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLiveStreamsTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: events.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final event = events[index];
        final isCritical = event.severity == 'critical';
        
        return GlassPanel(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                isCritical ? LucideIcons.alertTriangle : LucideIcons.activity, 
                color: isCritical ? AppTheme.critical : AppTheme.warning,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(event.type.toUpperCase(), style: Theme.of(context).textTheme.labelMedium),
                    const SizedBox(height: 4),
                    Text(event.description, style: Theme.of(context).textTheme.bodyLarge),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(LucideIcons.shield, color: Colors.white, size: 16),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("MindShield MHOC", style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold)),
                Text("MOBILE COMMAND", style: Theme.of(context).textTheme.labelMedium?.copyWith(fontSize: 8)),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          const SizedBox(height: 16),
          _buildTopKPIs(),
          const SizedBox(height: 16),
          Expanded(
            child: _currentIndex == 0 ? _buildIntelligenceTab() : _buildLiveStreamsTab(),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(LucideIcons.activity), label: "Intelligence"),
          BottomNavigationBarItem(icon: Icon(LucideIcons.database), label: "Live Streams"),
          BottomNavigationBarItem(icon: Icon(LucideIcons.users), label: "Roster"),
        ],
      ),
    );
  }
}
