import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // 1. Color Palette & Roles
  static const Color electricBlue = Color(0xFF3E6AE1);
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const Color lightAsh = Color(0xFFF4F4F4);
  static const Color carbonDark = Color(0xFF171A20);
  static const Color graphite = Color(0xFF393C41);
  static const Color pewter = Color(0xFF5C5E62);
  static const Color silverFog = Color(0xFF8E8E8E);
  static const Color cloudGray = Color(0xFFEEEEEE);
  static const Color paleSilver = Color(0xFFD0D1D2);

  // Semantic Categories
  static const Color priorityLow = Color(0xFF8E8E8E);
  static const Color priorityMedium = Color(0xFF3E6AE1);
  static const Color priorityHigh = Color(0xFFE53935);
  static const Color priorityUrgent = Color(0xFFD32F2F);

  // Border Radii Scale
  static const double radiusSharp = 0.0;
  static const double radiusButton = 4.0;
  static const double radiusCard = 12.0;
  static const double radiusIndicator = 50.0;

  // 2. Base Spacing System
  static const double space2 = 2.0;
  static const double space4 = 4.0;
  static const double space8 = 8.0;
  static const double space12 = 12.0;
  static const double space16 = 16.0;
  static const double space20 = 20.0;
  static const double space24 = 24.0;
  static const double space32 = 32.0;
  static const double space40 = 40.0;
  static const double space48 = 48.0;

  // 3. Typographic System (Universal Sans Split)
  static TextStyle get displayTitle => GoogleFonts.outfit(
        fontSize: 40.0,
        fontWeight: FontWeight.w500,
        color: carbonDark,
        height: 1.2,
      );

  static TextStyle get displayTitleWhite => GoogleFonts.outfit(
        fontSize: 40.0,
        fontWeight: FontWeight.w500,
        color: pureWhite,
        height: 1.2,
      );

  static TextStyle get productName => GoogleFonts.outfit(
        fontSize: 17.0,
        fontWeight: FontWeight.w500,
        color: carbonDark,
        height: 1.18,
      );

  static TextStyle get navItem => GoogleFonts.outfit(
        fontSize: 14.0,
        fontWeight: FontWeight.w500,
        color: carbonDark,
        height: 1.2,
      );

  static TextStyle get bodyRegular => GoogleFonts.outfit(
        fontSize: 14.0,
        fontWeight: FontWeight.w400,
        color: graphite,
        height: 1.43,
      );

  static TextStyle get bodyMedium => GoogleFonts.outfit(
        fontSize: 14.0,
        fontWeight: FontWeight.w500,
        color: graphite,
        height: 1.43,
      );

  static TextStyle get buttonLabel => GoogleFonts.outfit(
        fontSize: 14.0,
        fontWeight: FontWeight.w500,
        color: pureWhite,
        height: 1.2,
      );

  static TextStyle get subLink => GoogleFonts.outfit(
        fontSize: 14.0,
        fontWeight: FontWeight.w400,
        color: pewter,
        height: 1.43,
      );

  static TextStyle get promoText => GoogleFonts.outfit(
        fontSize: 22.0,
        fontWeight: FontWeight.w400,
        color: pureWhite,
        height: 0.91,
      );

  static TextStyle get captionText => GoogleFonts.outfit(
        fontSize: 12.0,
        fontWeight: FontWeight.w400,
        color: silverFog,
      );

  // 4. Flutter Theme Data Builder
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: pureWhite,
      primaryColor: electricBlue,
      colorScheme: const ColorScheme.light(
        primary: electricBlue,
        secondary: electricBlue,
        surface: pureWhite,
        background: pureWhite,
        error: priorityHigh,
      ),
      textTheme: TextTheme(
        displayLarge: displayTitle,
        titleMedium: productName,
        bodyLarge: bodyRegular,
        bodyMedium: bodyMedium,
        labelLarge: buttonLabel,
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: electricBlue,
          textStyle: subLink,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: cloudGray,
        thickness: 1.0,
        space: 1.0,
      ),
    );
  }
}
