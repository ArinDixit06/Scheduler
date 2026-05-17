import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/theme.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;

  const LoginScreen({Key? key, required this.onLoginSuccess}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Please fill in all fields.');
      return;
    }

    try {
      await Provider.of<AuthProvider>(context, listen: false).login(email, password);
      widget.onLoginSuccess();
    } catch (e) {
      setState(() => _error = 'Authentication failed.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.pureWhite,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppTheme.space32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo/Header
              Text(
                'APEX',
                style: AppTheme.displayTitle.copyWith(
                  letterSpacing: 4.0,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.space8),
              Text(
                'Subtractive Intelligence Suite',
                style: AppTheme.bodyRegular.copyWith(
                  color: AppTheme.pewter,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppTheme.space48),

              // Inputs Group
              if (_error != null) ...[
                Text(
                  _error!,
                  style: AppTheme.bodyRegular.copyWith(color: AppTheme.priorityHigh),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppTheme.space16),
              ],

              // Email Input
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.lightAsh,
                  borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                ),
                padding: const EdgeInsets.symmetric(horizontal: AppTheme.space16),
                child: TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Email address',
                    hintStyle: TextStyle(color: AppTheme.silverFog),
                  ),
                  style: AppTheme.bodyRegular,
                  keyboardType: TextInputType.emailAddress,
                ),
              ),
              const SizedBox(height: AppTheme.space16),

              // Password Input
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.lightAsh,
                  borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                ),
                padding: const EdgeInsets.symmetric(horizontal: AppTheme.space16),
                child: TextField(
                  controller: _passwordController,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Password',
                    hintStyle: TextStyle(color: AppTheme.silverFog),
                  ),
                  style: AppTheme.bodyRegular,
                  obscureText: true,
                ),
              ),
              const SizedBox(height: AppTheme.space32),

              // CTA button
              ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.electricBlue,
                  foregroundColor: AppTheme.pureWhite,
                  shadowColor: Colors.transparent,
                  elevation: 0.0,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                  ),
                ),
                child: Text(
                  'ACCESS WORKSPACE',
                  style: AppTheme.buttonLabel,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
