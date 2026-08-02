export interface Course {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  icon: string;
  duration: string;
  duration_en: string;
  price?: string;
  price_en?: string;
  schedule?: string;
  schedule_en?: string;
  imageUrl?: string;
  category?: string;
  status?: 'published' | 'hidden';
}

export interface Feature {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  icon: string;
}

export interface PromoItem {
  id: string;
  title: string;
  title_en: string;
  text: string;
  text_en: string;
  image: string;
  active?: boolean;
}

export interface PromoContent {
  popups?: PromoItem[];
  title?: string;
  title_en?: string;
  text?: string;
  text_en?: string;
  image?: string;
}
