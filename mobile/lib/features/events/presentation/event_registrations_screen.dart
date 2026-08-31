import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../data/event_repository.dart';

class EventRegistrationsScreen extends StatefulWidget {
  const EventRegistrationsScreen({
    super.key,
    required this.eventId,
    required this.eventTitle,
  });

  final String eventId;
  final String eventTitle;

  @override
  State<EventRegistrationsScreen> createState() => _EventRegistrationsScreenState();
}

class _EventRegistrationsScreenState extends State<EventRegistrationsScreen> {
  Future<List<Map<String, dynamic>>>? _future;
  List<Map<String, dynamic>> _allRegs = [];
  String _searchQuery = '';
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future ??= _loadRegistrations();
  }

  Future<List<Map<String, dynamic>>> _loadRegistrations() async {
    final repo = context.read<EventRepository>();
    final data = await repo.fetchEventRegistrations(widget.eventId);
    if (mounted) {
      setState(() {
        _allRegs = data;
      });
    }
    return data;
  }

  Future<void> _refresh() async {
    setState(() {
      _errorMessage = null;
      _future = _loadRegistrations();
    });
    try {
      await _future;
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Failed to load registrations. Check network.';
      });
    }
  }

  void _copyCsv() {
    if (_allRegs.isEmpty) return;
    final buffer = StringBuffer();
    buffer.writeln('Name,Email,Batch,Status');
    for (final reg in _allRegs) {
      final student = reg['studentId'] as Map?;
      final name = student?['name'] ?? 'N/A';
      final email = student?['email'] ?? 'N/A';
      final batch = student?['batch']?.toString() ?? 'N/A';
      final status = reg['status'] ?? 'N/A';
      buffer.writeln('"$name","$email","$batch","$status"');
    }
    Clipboard.setData(ClipboardData(text: buffer.toString()));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('CSV roster copied to clipboard!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text(widget.eventTitle, maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy_all),
            tooltip: 'Copy CSV Roster',
            onPressed: _allRegs.isEmpty ? null : _copyCsv,
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: FutureBuilder<List<Map<String, dynamic>>>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError || _errorMessage != null) {
                return ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        color: Colors.white.withAlpha(8),
                      ),
                      child: Column(
                        children: [
                          const Text('Something went wrong'),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: _refresh,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              }

              final filtered = _allRegs.where((reg) {
                final student = reg['studentId'] as Map?;
                final name = (student?['name'] ?? '').toString().toLowerCase();
                final email = (student?['email'] ?? '').toString().toLowerCase();
                final batch = (student?['batch'] ?? '').toString().toLowerCase();
                final s = _searchQuery.toLowerCase();
                return name.contains(s) || email.contains(s) || batch.contains(s);
              }).toList();

              return Column(
                children: [
                  // Search bar & stats header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                    child: Column(
                      children: [
                        TextField(
                          onChanged: (val) => setState(() => _searchQuery = val),
                          decoration: InputDecoration(
                            hintText: 'Search by name, email, batch...',
                            prefixIcon: const Icon(Icons.search),
                            filled: true,
                            fillColor: Colors.white.withAlpha(10),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(30),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'TOTAL: ${_allRegs.length}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                            ),
                            Text(
                              'ATTENDED: ${_allRegs.where((r) => r['status'] == 'attended').length}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: filtered.isEmpty
                        ? const Center(child: Text('No registrations found'))
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            itemCount: filtered.length,
                            itemBuilder: (context, index) {
                              final reg = filtered[index];
                              final student = reg['studentId'] as Map?;
                              final name = student?['name'] ?? 'N/A';
                              final email = student?['email'] ?? 'N/A';
                              final batch = student?['batch']?.toString() ?? 'N/A';
                              final status = reg['status'] ?? 'N/A';
                              final isAttended = status == 'attended';

                              return Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(20),
                                  color: Colors.white.withAlpha(8),
                                  border: Border.all(color: Colors.white.withAlpha(16)),
                                ),
                                padding: const EdgeInsets.all(14),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: isAttended ? const Color(0xFF34D399).withAlpha(30) : Colors.white.withAlpha(12),
                                      child: Text(
                                        name.isEmpty ? 'U' : name[0].toUpperCase(),
                                        style: TextStyle(
                                          color: isAttended ? const Color(0xFF34D399) : Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            name,
                                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            email,
                                            style: const TextStyle(fontSize: 12, color: Colors.white54),
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            'Batch $batch',
                                            style: const TextStyle(fontSize: 11, color: Colors.white38),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(12),
                                        color: isAttended
                                            ? const Color(0xFF34D399).withAlpha(20)
                                            : const Color(0xFF5CC8FF).withAlpha(20),
                                        border: Border.all(
                                          color: isAttended
                                              ? const Color(0xFF34D399).withAlpha(40)
                                              : const Color(0xFF5CC8FF).withAlpha(40),
                                        ),
                                      ),
                                      child: Text(
                                        status.toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: isAttended ? const Color(0xFF34D399) : const Color(0xFF5CC8FF),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
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
