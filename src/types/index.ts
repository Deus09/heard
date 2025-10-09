// ===========================
// DATABASE TYPES (Supabase'den gelen tipler)
// ===========================

/**
 * Yorum (Comment) veritabanı tipi
 */
export interface Comment {
  id: string;
  user_id: string | null;
  username: string;
  business_name: string;
  city: string;
  district: string;
  experience: string;
  rating: number;
  anonymous: boolean;
  created_at: string;
}

/**
 * Duyuru (Announce) veritabanı tipi
 */
export interface Announce {
  id: string;
  comment_id: string;
  user_id: string | null;
  user_identifier: string;
  created_at: string;
}

// Supabase'in kendi tiplerini import ediyoruz
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Kullanıcı profili (Profile) veritabanı tipi
 */
export interface Profile {
  id: string;
  username: string;
  email?: string;
  created_at: string;
}

/**
 * Supabase kullanıcı tipi
 */
export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
  };
}

/**
 * Supabase session tipi
 */
export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: SupabaseUser;
  expires_in?: number;
  expires_at?: number;
}

// ===========================
// ENHANCED TYPES (UI için)
// ===========================

/**
 * Duyuru sayısı ve kullanıcının duyuru durumunu içeren yorum tipi
 */
export interface CommentWithAnnounces extends Comment {
  announceCount: number;
  hasAnnounced: boolean;
}

/**
 * Sayfalı yorum yanıtı (Offset-based - Legacy)
 */
export interface PaginatedCommentsResponse {
  data: Comment[];
  count: number;
  hasMore: boolean;
}

/**
 * Duyurulu sayfalı yorum yanıtı (Offset-based - Legacy)
 */
export interface PaginatedCommentsWithAnnouncesResponse {
  data: CommentWithAnnounces[];
  count: number;
  hasMore: boolean;
}

/**
 * Cursor-based pagination için cursor tipi
 * created_at ve id'den oluşur
 */
export interface PaginationCursor {
  created_at: string;
  id: string;
}

/**
 * Cursor-based pagination metadata
 */
export interface CursorPaginationMeta {
  nextCursor: PaginationCursor | null;
  prevCursor: PaginationCursor | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount?: number; // Optional - performans için approximate olabilir
}

/**
 * Cursor-based sayfalı yorum yanıtı
 */
export interface CursorPaginatedCommentsResponse {
  data: Comment[];
  pagination: CursorPaginationMeta;
}

/**
 * Duyurulu cursor-based sayfalı yorum yanıtı
 */
export interface CursorPaginatedCommentsWithAnnouncesResponse {
  data: CommentWithAnnounces[];
  pagination: CursorPaginationMeta;
}

/**
 * SSR için initial data tipi
 */
export interface InitialCommentsData {
  comments: CommentWithAnnounces[];
  nextCursor: PaginationCursor | null;
  hasMore: boolean;
  totalCount: number;
}

// ===========================
// FORM TYPES
// ===========================

/**
 * Yorum ekleme formu verisi
 */
export interface AddReviewFormData {
  businessName: string;
  city: string;
  district: string;
  experience: string;
  rating: number;
}

/**
 * Giriş/Kayıt formu verisi
 */
export interface AuthFormData {
  email: string;
  password: string;
  username: string;
}

// ===========================
// ERROR TYPES
// ===========================

/**
 * Özel uygulama hatası
 */
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
}

/**
 * Supabase hatası
 */
export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

// ===========================
// REALTIME TYPES
// ===========================

/**
 * Supabase realtime payload tipi
 */
export interface RealtimePayload<T = Comment> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: null | string[];
}

/**
 * Yorumlar için realtime payload
 */
export type CommentRealtimePayload = RealtimePayload<Comment>;

// ===========================
// AUTH CALLBACK TYPES
// ===========================

/**
 * Auth state değişiklik callback tipi (Supabase'in kendi tiplerini kullanıyoruz)
 */
export type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void | Promise<void>;

/**
 * Yorumlar için subscription callback tipi
 */
export type CommentsSubscriptionCallback = (payload: CommentRealtimePayload) => void;
