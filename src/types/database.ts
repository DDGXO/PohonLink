export type UserRole = 'user' | 'vip' | 'admin';
export type LinkType = 'link' | 'heading' | 'text' | 'spacer' | 'email' | 'telephone' | 'html';
export type EventType = 'pageview' | 'click';

export interface ProfileSettings {
  open_links_new_tab: boolean;
  show_share_button: boolean;
  show_verified_badge: boolean;
  hide_username?: boolean;
  social_links?: Record<string, string>;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  bg_url: string | null;
  role: UserRole;
  is_blocked: boolean;
  theme_config: ThemeConfig;
  settings: ProfileSettings;
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  preset: string;
  bg_type: 'color' | 'image';
  bg_value: string;
  card_bg: string;
  text_color: string;
  btn_radius: string;
  btn_style: 'solid' | 'outline' | 'ghost';
  font: string;
  custom_css?: string;
  custom_html?: string;
}

export interface Link {
  id: string;
  user_id: string;
  type: LinkType;
  title: string | null;
  url: string | null;
  icon: string | null;
  sort_order: number;
  is_pinned: boolean;
  is_active: boolean;
  click_count: number;
  custom_css: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  profile_id: string;
  link_id: string | null;
  event: EventType;
  referer: string | null;
  os: string | null;
  device: string | null;
  country: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      links: {
        Row: Link;
        Insert: Omit<Link, 'id' | 'created_at' | 'updated_at' | 'click_count'>;
        Update: Partial<Omit<Link, 'id' | 'created_at' | 'updated_at'>>;
        Relationships: [];
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      link_type: LinkType;
      event_type: EventType;
    };
    CompositeTypes: Record<string, never>;
  };
}
