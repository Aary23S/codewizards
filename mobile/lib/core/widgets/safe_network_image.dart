import 'package:flutter/material.dart';

class SafeNetworkImage extends StatelessWidget {
  const SafeNetworkImage({
    super.key,
    required this.imageUrl,
    required this.placeholder,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
  });

  final String? imageUrl;
  final Widget placeholder;
  final BoxFit fit;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    final url = imageUrl?.trim();
    if (!_isRenderableUrl(url)) {
      return placeholder;
    }

    return Image.network(
      url!,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) => placeholder,
    );
  }

  bool _isRenderableUrl(String? url) {
    if (url == null || url.isEmpty) return false;

    final parsed = Uri.tryParse(url);
    if (parsed == null || !parsed.hasScheme || !parsed.hasAuthority) return false;
    if (parsed.scheme != 'http' && parsed.scheme != 'https') return false;

    final host = parsed.host.toLowerCase();
    if (host == 'placehold.co' || host.endsWith('.placehold.co')) return false;

    return true;
  }
}
