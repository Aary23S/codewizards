import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/token_storage.dart';

class ApiClient {
  ApiClient(this._tokenStorage)
      : _dio = Dio(
          BaseOptions(
            baseUrl: AppConfig.apiBaseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 20),
            sendTimeout: const Duration(seconds: 20),
            headers: const {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final TokenStorage _tokenStorage;
  final Dio _dio;

  Future<dynamic> getData(String path, {Map<String, dynamic>? queryParameters}) async {
    final response = await _dio.get<dynamic>(
      path,
      queryParameters: queryParameters,
    );
    return _extractData(response.data);
  }

  Future<dynamic> postData(String path, {Object? data}) async {
    final response = await _dio.post<dynamic>(path, data: data);
    return _extractData(response.data);
  }

  Future<dynamic> patchData(String path, {Object? data}) async {
    final response = await _dio.patch<dynamic>(path, data: data);
    return _extractData(response.data);
  }

  Future<dynamic> putData(String path, {Object? data}) async {
    final response = await _dio.put<dynamic>(path, data: data);
    return _extractData(response.data);
  }

  Future<dynamic> deleteData(String path) async {
    final response = await _dio.delete<dynamic>(path);
    return _extractData(response.data);
  }

  dynamic _extractData(dynamic payload) {
    if (payload is Map<String, dynamic> && payload.containsKey('data')) {
      return payload['data'];
    }
    return payload;
  }
}
