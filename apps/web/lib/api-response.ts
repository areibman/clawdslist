import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export function successResponse<T>(
  data: T,
  meta?: ApiResponse['meta'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof Error) {
    switch (error.message) {
      case 'UNAUTHORIZED':
        return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
      case 'FORBIDDEN':
        return errorResponse('FORBIDDEN', 'Access denied', 403);
      case 'NOT_FOUND':
        return errorResponse('NOT_FOUND', 'Resource not found', 404);
      case 'VALIDATION_ERROR':
        return errorResponse('VALIDATION_ERROR', 'Invalid input', 400);
      default:
        return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
}
