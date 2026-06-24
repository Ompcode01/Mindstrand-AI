import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // MindShield AI Cyberpunk Palette
  static const Color background = Color(0xFF050508);
  static const Color surface = Color(0xFF0a0a0f);
  static const Color primary = Color(0xFF7c54ff);
  static const Color accent = Color(0xFF22d3a0);
  static const Color warning = Color(0xFFf59e0b);
  static const Color critical = Color(0xFFef4444);
  static const Color textMain = Color(0xFFe8e6f0);
  static const Color textMuted = Color(0xFF8b8aa0);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: accent,
        surface: surface,
        background: background,
        error: critical,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.inter(color: textMain, fontWeight: FontWeight.bold),
        bodyLarge: GoogleFonts.inter(color: textMain),
        bodyMedium: GoogleFonts.inter(color: textMuted),
        labelMedium: GoogleFonts.ibmPlexMono(color: textMuted, letterSpacing: 1.2), // Used for monospaced UI text
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: primary,
        unselectedItemColor: textMuted,
      ),
    );
  }
}
