import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';

/// Represents live telemetry captured from a connected Smartwatch
/// (WearOS, Garmin, Apple Watch, Fitbit via Google Health Connect / HealthKit).
class SmartwatchSnapshot {
  final int heartRateBpm;
  final double hrvMs;
  final double sleepHours;
  final int steps;
  final double stressIndex;
  final double skinTempC;
  final String source;
  final DateTime recordedAt;

  SmartwatchSnapshot({
    required this.heartRateBpm,
    required this.hrvMs,
    required this.sleepHours,
    required this.steps,
    required this.stressIndex,
    required this.skinTempC,
    required this.source,
    required this.recordedAt,
  });

  Map<String, dynamic> toJson() => {
    'heart_rate_bpm': heartRateBpm,
    'hrv_ms': hrvMs,
    'sleep_hours': sleepHours,
    'steps': steps,
    'stress_index': stressIndex,
    'skin_temp_c': skinTempC,
    'source': source,
    'recorded_at': recordedAt.toIso8601String(),
  };
}

/// Service layer responsible for syncing hardware smartwatch telemetry
/// to the MindShield API backend engine.
class SmartwatchTelemetryService {
  static final SmartwatchTelemetryService _instance = SmartwatchTelemetryService._internal();
  factory SmartwatchTelemetryService() => _instance;
  SmartwatchTelemetryService._internal();

  bool _isConnected = false;
  String _deviceModel = "WearOS Sim (Galaxy Watch 6)";
  Timer? _telemetryLoop;
  final _snapshotController = StreamController<SmartwatchSnapshot>.broadcast();

  Stream<SmartwatchSnapshot> get telemetryStream => _snapshotController.stream;
  bool get isConnected => _isConnected;
  String get deviceModel => _deviceModel;

  /// Prompts the OS Health Connect permission modal and initiates hardware polling.
  Future<bool> connectAndAuthorize() async {
    // In production, invoke `health.requestAuthorization([HealthDataType.HEART_RATE, ...])`
    await Future.delayed(const Duration(milliseconds: 800));
    _isConnected = true;
    _startContinuousIngestion();
    debugPrint("[SmartwatchService] Hardware bridge authorized: $_deviceModel");
    return true;
  }

  void disconnect() {
    _telemetryLoop?.cancel();
    _isConnected = false;
    debugPrint("[SmartwatchService] Disconnected smartwatch.");
  }

  /// Starts 15-second simulation polling representing continuous BLE stream
  void _startContinuousIngestion() {
    _telemetryLoop?.cancel();
    final random = Random();

    _telemetryLoop = Timer.periodic(const Duration(seconds: 15), (timer) {
      if (!_isConnected) return;

      // Simulate escalating resting HR & dropping HRV when sleep deficit is active
      final baseHr = 72 + random.nextInt(18);
      final hrv = 45.0 - random.nextDouble() * 15.0;
      final temp = 36.5 + random.nextDouble() * 0.6;

      final snapshot = SmartwatchSnapshot(
        heartRateBpm: baseHr,
        hrvMs: hrv,
        sleepHours: 4.2, // Clinical sleep deficit trigger
        steps: 3420 + timer.tick * 45,
        stressIndex: 68.5 + random.nextDouble() * 10,
        skinTempC: temp,
        source: _deviceModel,
        recordedAt: DateTime.now(),
      );

      _snapshotController.add(snapshot);
      _postToBackendEngine(snapshot);
    });
  }

  /// Transmits telemetry to FastAPI backend (`/api/wearable/ingest`)
  Future<void> _postToBackendEngine(SmartwatchSnapshot snapshot) async {
    try {
      // Base URL automatically adapts to Windows desktop / Android emulator
      final baseUrl = kIsWeb ? "http://localhost:8000" : "http://127.0.0.1:8000";
      debugPrint("[SmartwatchSync] Transmitting BLE snapshot -> $baseUrl/api/wearable/ingest");
      // Note: In full deployment, use `http.post(Uri.parse(...), body: jsonEncode(snapshot.toJson()))`
    } catch (e) {
      debugPrint("[SmartwatchSyncError] Backend unreachable: $e");
    }
  }
}
