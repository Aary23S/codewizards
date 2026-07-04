import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/network/api_client.dart';
import 'core/storage/token_storage.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/auth_repository.dart';
import 'features/admin/data/admin_repository.dart';
import 'features/events/data/event_repository.dart';
import 'features/explore/data/explore_repository.dart';
import 'features/home/data/home_repository.dart';
import 'features/auth/presentation/auth_gate.dart';
import 'features/profile/data/profile_repository.dart';
import 'features/team/data/team_repository.dart';

class CodeWizardsApp extends StatelessWidget {
  const CodeWizardsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<TokenStorage>(create: (_) => TokenStorage()),
        Provider<ApiClient>(create: (context) => ApiClient(context.read<TokenStorage>())),
        Provider<AuthRepository>(create: (context) => AuthRepository(context.read<ApiClient>())),
        Provider<AdminRepository>(create: (context) => AdminRepository(context.read<ApiClient>())),
        Provider<HomeRepository>(create: (context) => HomeRepository(context.read<ApiClient>())),
        Provider<EventRepository>(create: (context) => EventRepository(context.read<ApiClient>())),
        Provider<ExploreRepository>(create: (context) => ExploreRepository(context.read<ApiClient>())),
        Provider<ProfileRepository>(create: (context) => ProfileRepository(context.read<ApiClient>())),
        Provider<TeamRepository>(create: (context) => TeamRepository(context.read<ApiClient>())),
        ChangeNotifierProvider<AuthController>(
          create: (context) => AuthController(context.read<AuthRepository>(), context.read<TokenStorage>()),
        ),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'CodeWizards',
        theme: buildAppTheme(),
        home: const AuthGate(),
      ),
    );
  }
}
