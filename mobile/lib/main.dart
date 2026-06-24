import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(const MindShieldApp());
}

class MindShieldApp extends StatelessWidget {
  const MindShieldApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MindShield AI',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const DashboardScreen(),
    );
  }
}
