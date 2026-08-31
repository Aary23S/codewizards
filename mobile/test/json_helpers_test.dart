import 'package:flutter_test/flutter_test.dart';
import 'package:codewizards/core/utils/json_helpers.dart';

void main() {
  group('readStringList', () {
    test('maps a JSON list to strings, dropping empties', () {
      expect(readStringList(['React', '', 'Node']), ['React', 'Node']);
    });

    test('splits a comma-separated string', () {
      expect(readStringList('React, Node ,  '), ['React', 'Node']);
    });

    test('returns empty list for null/unsupported input', () {
      expect(readStringList(null), <String>[]);
      expect(readStringList(42), <String>[]);
    });
  });

  group('readBool', () {
    test('passes through real booleans', () {
      expect(readBool(true), true);
      expect(readBool(false), false);
    });

    test('parses the string "true" case-insensitively', () {
      expect(readBool('TRUE'), true);
      expect(readBool('false'), false);
      expect(readBool('yes'), false);
    });
  });

  group('readInt', () {
    test('handles int, num, and numeric strings', () {
      expect(readInt(5), 5);
      expect(readInt(5.9), 5);
      expect(readInt('42'), 42);
    });

    test('returns null for unparseable input', () {
      expect(readInt('not a number'), null);
      expect(readInt(null), null);
    });
  });

  group('readHttpUrl', () {
    test('accepts valid http/https URLs', () {
      expect(readHttpUrl('https://github.com/codewizards'), 'https://github.com/codewizards');
      expect(readHttpUrl(' http://example.com '), 'http://example.com');
    });

    test('rejects non-http(s) schemes and malformed input', () {
      expect(readHttpUrl('javascript:alert(1)'), null);
      expect(readHttpUrl('ftp://example.com'), null);
      expect(readHttpUrl(''), null);
      expect(readHttpUrl(null), null);
    });
  });

  group('readString', () {
    test('stringifies non-null values and falls back for null', () {
      expect(readString(42), '42');
      expect(readString(null, fallback: 'N/A'), 'N/A');
    });
  });
}
