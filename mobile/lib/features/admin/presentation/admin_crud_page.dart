import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../shared/widgets/brand_logo.dart';
import '../../auth/auth_controller.dart';

enum AdminFieldType { text, multiline, number, boolean, dropdown }

class AdminFieldSpec {
  const AdminFieldSpec({
    required this.key,
    required this.label,
    this.type = AdminFieldType.text,
    this.options = const [],
    this.hintText,
    this.required = true,
  });

  final String key;
  final String label;
  final AdminFieldType type;
  final List<String> options;
  final String? hintText;
  final bool required;
}

class AdminRecordCardData {
  const AdminRecordCardData({
    required this.title,
    required this.subtitle,
    this.badges = const [],
    this.canEdit = true,
    this.canDelete = true,
    this.extraActionLabel,
    this.secondaryActionLabel,
  });

  final String title;
  final String subtitle;
  final List<String> badges;
  final bool canEdit;
  final bool canDelete;
  final String? extraActionLabel;
  final String? secondaryActionLabel;
}

class AdminCrudConfig {
  const AdminCrudConfig({
    required this.title,
    required this.eyebrow,
    required this.description,
    required this.loader,
    required this.create,
    required this.update,
    required this.delete,
    required this.fields,
    required this.cardData,
    this.canCreate = true,
    this.canEdit = true,
    this.createButtonLabel = 'Add',
    this.emptyMessage = 'No records found.',
    this.formTitle,
    this.extraAction,
    this.secondaryAction,
    this.onItemTap,
  });

  final String title;
  final String eyebrow;
  final String description;
  final Future<List<Map<String, dynamic>>> Function() loader;
  final Future<void> Function(Map<String, dynamic> payload) create;
  final Future<void> Function(String id, Map<String, dynamic> payload) update;
  final Future<void> Function(String id) delete;
  final List<AdminFieldSpec> fields;
  final AdminRecordCardData Function(Map<String, dynamic> item) cardData;
  final bool canCreate;
  final bool canEdit;
  final String createButtonLabel;
  final String emptyMessage;
  final String? formTitle;
  final Future<void> Function(Map<String, dynamic> item)? extraAction;
  final Future<void> Function(Map<String, dynamic> item)? secondaryAction;
  final Future<void> Function(Map<String, dynamic> item)? onItemTap;
}

class AdminCrudPage extends StatefulWidget {
  const AdminCrudPage({super.key, required this.config});

  final AdminCrudConfig config;

  @override
  State<AdminCrudPage> createState() => _AdminCrudPageState();
}

class _AdminCrudPageState extends State<AdminCrudPage> {
  Future<List<Map<String, dynamic>>>? _future;
  String? _errorMessage;
  bool _busy = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= _loadRecords();
  }

  Future<List<Map<String, dynamic>>> _loadRecords() async {
    final auth = context.read<AuthController>();
    try {
      return await widget.config.loader();
    } catch (error) {
      if (error.toString().contains('401')) {
        await auth.logout();
      }
      rethrow;
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = _loadRecords();
    });
    try {
      await _future;
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _friendlyError(error));
    }
  }

  Future<void> _openEditor({Map<String, dynamic>? initial}) async {
    if (_busy) return;
    final auth = context.read<AuthController>();
    final result = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return _AdminRecordEditorSheet(
          title: initial == null ? widget.config.formTitle ?? 'Create ${widget.config.title}' : 'Edit ${widget.config.title}',
          fields: widget.config.fields,
          initialValues: initial ?? const {},
        );
      },
    );

    if (result == null) return;

    setState(() => _busy = true);
    try {
      if (initial == null) {
        await widget.config.create(result);
      } else {
        final id = _id(initial);
        if (id == null) return;
        await widget.config.update(id, result);
      }
      await _refresh();
    } catch (error) {
      if (error.toString().contains('401')) {
        await auth.logout();
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_friendlyError(error))));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _deleteItem(Map<String, dynamic> item) async {
    final id = _id(item);
    if (id == null || _busy) return;
    final auth = context.read<AuthController>();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Delete record?'),
          content: const Text('This action cannot be undone.'),
          actions: [
            TextButton(onPressed: () => Navigator.of(dialogContext).pop(false), child: const Text('Cancel')),
            TextButton(onPressed: () => Navigator.of(dialogContext).pop(true), child: const Text('Delete')),
          ],
        );
      },
    );
    if (confirm != true) return;
    setState(() => _busy = true);
    try {
      await widget.config.delete(id);
      await _refresh();
    } catch (error) {
      if (error.toString().contains('401')) {
        await auth.logout();
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_friendlyError(error))));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const BrandLogo(size: 30, showLabel: true),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<List<Map<String, dynamic>>>(
            future: _future,
            builder: (context, snapshot) {
              final loading = snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData;
              final items = snapshot.data ?? const <Map<String, dynamic>>[];

              if (snapshot.hasError || _errorMessage != null) {
                return ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                  children: [
                    _ErrorPanel(message: _errorMessage ?? _friendlyError(snapshot.error), onRetry: _refresh),
                  ],
                );
              }

              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                children: [
                  _SectionHeader(
                    eyebrow: widget.config.eyebrow,
                    title: widget.config.title,
                    description: widget.config.description,
                  ),
                  const SizedBox(height: 14),
                  if (widget.config.canCreate)
                    Align(
                      alignment: Alignment.centerLeft,
                      child: ElevatedButton(
                        onPressed: _busy ? null : () => _openEditor(),
                        child: Text(widget.config.createButtonLabel),
                      ),
                    ),
                  if (widget.config.canCreate) const SizedBox(height: 14),
                  if (loading)
                    const _LoadingPanel()
                  else if (items.isEmpty)
                    _EmptyPanel(message: widget.config.emptyMessage)
                  else
                    ...items.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                    child: _AdminRecordCard(
                          data: widget.config.cardData(item),
                          onEdit: widget.config.canEdit ? () => _openEditor(initial: item) : null,
                          onDelete: () => _deleteItem(item),
                          onExtraAction: widget.config.extraAction == null ? null : () => widget.config.extraAction!(item),
                          onSecondaryAction: widget.config.secondaryAction == null ? null : () => widget.config.secondaryAction!(item),
                          onTap: widget.config.onItemTap == null ? null : () => widget.config.onItemTap!(item),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _AdminRecordEditorSheet extends StatefulWidget {
  const _AdminRecordEditorSheet({
    required this.title,
    required this.fields,
    required this.initialValues,
  });

  final String title;
  final List<AdminFieldSpec> fields;
  final Map<String, dynamic> initialValues;

  @override
  State<_AdminRecordEditorSheet> createState() => _AdminRecordEditorSheetState();
}

class _AdminRecordEditorSheetState extends State<_AdminRecordEditorSheet> {
  final _formKey = GlobalKey<FormState>();
  late final Map<String, TextEditingController> _controllers;
  late final Map<String, bool> _boolValues;
  late final Map<String, String?> _dropdownValues;

  @override
  void initState() {
    super.initState();
    _controllers = {
      for (final field in widget.fields)
        field.key: TextEditingController(text: _readText(widget.initialValues[field.key])),
    };
    _boolValues = {
      for (final field in widget.fields)
        if (field.type == AdminFieldType.boolean) field.key: _readBool(widget.initialValues[field.key]),
    };
    _dropdownValues = {
      for (final field in widget.fields)
        if (field.type == AdminFieldType.dropdown) field.key: _matchDropdownValue(field.options, widget.initialValues[field.key]),
    };
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    final payload = <String, dynamic>{};
    for (final field in widget.fields) {
      switch (field.type) {
        case AdminFieldType.boolean:
          payload[field.key] = _boolValues[field.key] ?? false;
          break;
        case AdminFieldType.dropdown:
          final value = _dropdownValues[field.key] ?? '';
          if (value.isNotEmpty) payload[field.key] = value;
          break;
        case AdminFieldType.number:
          final text = _controllers[field.key]!.text.trim();
          if (text.isNotEmpty) payload[field.key] = int.tryParse(text) ?? double.tryParse(text) ?? text;
          break;
        case AdminFieldType.text:
        case AdminFieldType.multiline:
          final text = _controllers[field.key]!.text.trim();
          if (text.isNotEmpty) payload[field.key] = text;
          break;
      }
    }
    Navigator.of(context).pop(payload);
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.55,
      maxChildSize: 0.96,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Color(0xFF101010),
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: EdgeInsets.fromLTRB(18, 12, 18, 18 + bottomInset),
          child: Form(
            key: _formKey,
            child: ListView(
              controller: scrollController,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(widget.title, style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                for (final field in widget.fields) ...[
                  if (field.type == AdminFieldType.boolean)
                    SwitchListTile(
                      value: _boolValues[field.key] ?? false,
                      onChanged: (value) => setState(() => _boolValues[field.key] = value),
                      title: Text(field.label),
                    )
                  else if (field.type == AdminFieldType.dropdown)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: DropdownButtonFormField<String>(
                        initialValue: _dropdownValues[field.key],
                        decoration: InputDecoration(labelText: field.label),
                        items: field.options
                            .map((option) => DropdownMenuItem(value: option, child: Text(option)))
                            .toList(),
                        onChanged: (value) => setState(() => _dropdownValues[field.key] = value),
                      ),
                    )
                  else
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: TextFormField(
                        controller: _controllers[field.key],
                        maxLines: field.type == AdminFieldType.multiline ? 5 : 1,
                        keyboardType: field.type == AdminFieldType.number ? TextInputType.number : TextInputType.text,
                        decoration: InputDecoration(
                          labelText: field.label,
                          hintText: field.hintText,
                        ),
                        validator: (value) {
                          if (!field.required) return null;
                          if (value == null || value.trim().isEmpty) {
                            return field.label.isNotEmpty ? 'Enter ${field.label.toLowerCase()}' : 'Required';
                          }
                          return null;
                        },
                      ),
                    ),
                ],
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: _submit,
                  child: const Text('Save'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _AdminRecordCard extends StatelessWidget {
  const _AdminRecordCard({
    required this.data,
    required this.onDelete,
    this.onEdit,
    this.onExtraAction,
    this.onSecondaryAction,
    this.onTap,
  });

  final AdminRecordCardData data;
  final VoidCallback onDelete;
  final VoidCallback? onEdit;
  final VoidCallback? onExtraAction;
  final VoidCallback? onSecondaryAction;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LayoutBuilder(
            builder: (context, constraints) {
              final narrow = constraints.maxWidth < 420;
              final actionButtons = <Widget>[
                if (data.extraActionLabel != null && onExtraAction != null)
                  TextButton(onPressed: onExtraAction, child: Text(data.extraActionLabel!)),
                if (data.secondaryActionLabel != null && onSecondaryAction != null)
                  TextButton(onPressed: onSecondaryAction, child: Text(data.secondaryActionLabel!)),
                if (data.canEdit && onEdit != null)
                  TextButton(onPressed: onEdit, child: const Text('Edit')),
                if (data.canDelete)
                  TextButton(onPressed: onDelete, child: const Text('Delete')),
              ];

              if (narrow) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(data.title, style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 6),
                        Text(data.subtitle, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.4)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: actionButtons,
                    ),
                  ],
                );
              }

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(data.title, style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 6),
                        Text(data.subtitle, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.4)),
                      ],
                    ),
                  ),
                  Wrap(
                    spacing: 8,
                    children: actionButtons,
                  ),
                ],
              );
            },
          ),
          if (data.badges.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: data.badges
                  .map(
                    (badge) => Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(999),
                        color: Colors.white.withAlpha(10),
                        border: Border.all(color: Colors.white.withAlpha(20)),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      child: Text(badge, style: Theme.of(context).textTheme.labelSmall),
                    ),
                  )
                  .toList(),
            ),
          ],
        ],
      ),
    );

    if (onTap == null) {
      return card;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: card,
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.eyebrow,
    required this.title,
    required this.description,
  });

  final String eyebrow;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          eyebrow.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                letterSpacing: 3,
                color: Colors.white54,
              ),
        ),
        const SizedBox(height: 8),
        Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 24)),
        const SizedBox(height: 6),
        Text(description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
      ],
    );
  }
}

class _LoadingPanel extends StatelessWidget {
  const _LoadingPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      child: const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  const _EmptyPanel({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
    );
  }
}

class _ErrorPanel extends StatelessWidget {
  const _ErrorPanel({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        color: Colors.white.withAlpha(10),
        border: Border.all(color: Colors.white.withAlpha(20)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Unable to load admin data', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(message, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.5)),
          const SizedBox(height: 14),
          OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}

String _friendlyError(Object? error) {
  final text = error.toString();
  if (text.contains('401')) return 'Your session expired. Please sign in again.';
  if (text.contains('SocketException') || text.contains('DioException')) {
    return 'Cannot reach the backend. Check the API URL and network.';
  }
  return 'Something went wrong.';
}

String? _id(Map<String, dynamic> item) {
  final value = item['_id'] ?? item['id'];
  final text = value?.toString().trim();
  if (text == null || text.isEmpty) return null;
  return text;
}

String _readText(dynamic value) {
  final text = value?.toString().trim();
  return text ?? '';
}

bool _readBool(dynamic value) {
  if (value is bool) return value;
  final text = value?.toString().toLowerCase();
  return text == 'true' || text == '1' || text == 'yes';
}

String? _matchDropdownValue(List<String> options, dynamic rawValue) {
  final text = _readText(rawValue);
  if (text.isEmpty) return null;
  for (final option in options) {
    if (option.toLowerCase() == text.toLowerCase()) {
      return option;
    }
  }
  return options.contains(text) ? text : null;
}
