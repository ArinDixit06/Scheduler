import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  String _userName = 'Arin Dixit';
  bool _isLoggedIn = true;
  int _todayEnergyScore = 0; // 0 means unlogged, 1-5 represents score

  String get userName => _userName;
  bool get isLoggedIn => _isLoggedIn;
  int get todayEnergyScore => _todayEnergyScore;

  AuthProvider() {
    _loadState();
  }

  Future<void> _loadState() async {
    final prefs = await SharedPreferences.getInstance();
    _userName = prefs.getString('user_name') ?? 'Arin Dixit';
    _isLoggedIn = prefs.getBool('is_logged_in') ?? true;
    _todayEnergyScore = prefs.getInt('today_energy_score') ?? 0;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoggedIn = true;
    _userName = email.split('@')[0];
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_logged_in', true);
    await prefs.setString('user_name', _userName);
    notifyListeners();
  }

  Future<void> logout() async {
    _isLoggedIn = false;
    _todayEnergyScore = 0;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_logged_in', false);
    await prefs.remove('today_energy_score');
    notifyListeners();
  }

  Future<void> logEnergy(int score) async {
    if (score < 1 || score > 5) return;
    _todayEnergyScore = score;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('today_energy_score', score);
    notifyListeners();
  }
}
