import 'package:flutter_test/flutter_test.dart';

import 'package:codewizards/app.dart';

void main() {
  testWidgets('App boots without crashing', (tester) async {
    await tester.pumpWidget(const CodeWizardsApp());
    expect(find.byType(CodeWizardsApp), findsOneWidget);
  });
}
