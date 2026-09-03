export type UserRole = 'user' | 'vip' | 'admin';
export type LinkType = 'link' | 'heading' | 'text' | 'spacer' | 'email' | 'telephone' | 'html';
export type EventType = 'pageview' | 'click';

export interface ProfileSettings {
  open_links_new_tab: boolean;
  show_share_button: boolean;
  show_verified_badge: boolean;
  hide_username?: boolean;
  avatar_shape?: 'circle' | 'rounded' | 'square';
  social_position?: 'top' | 'bottom';
  show_footer?: boolean;
  custom_footer_text?: string;
  social_links?: Record<string, string>;
  enable_shop?: boolean;
  shop_title?: string;
  shop_layout?: 'grid' | 'list';
}

export interface ProductMeta {
  price?: number | string;
  original_price?: number | string;
  currency?: string;
  image_url?: string;
  button_text?: string;
  badge?: string;
  category?: string;
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
  bg_type: 'color' | 'gradient' | 'image' | 'video' | 'animated';
  bg_value: string;
  gradient_direction?: 'to_bottom' | 'to_top' | 'to_diagonal' | 'radial';
  gradient_color1?: string;
  gradient_color2?: string;
  card_bg: string;
  text_color: string;
  btn_radius: string;
  btn_style: 'solid' | 'outline' | 'glass' | 'hard_shadow' | 'soft_shadow';
  btn_shadow_color?: string;
  btn_glass_opacity?: number;
  btn_glass_blur?: number;
  layout_type?: 'list' | 'grid' | 'carousel';
  font: string;
  animated_bg?:
    | 'matrix'
    | 'ascii_aquarium'
    | 'starfield'
    | 'particles'
    | 'synthwave'
    | 'aura'
    | 'cyber_rain'
    | 'galaxy_spiral'
    | 'cyber_waves'
    | 'retro_terminal'
    | 'neon_embers';
  video_url?: string;
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
