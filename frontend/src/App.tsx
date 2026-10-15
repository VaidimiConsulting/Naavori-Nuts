import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Home,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Star,
  Trash2,
  X,
  User,
  Lock,
  Phone,
  Package,
  LogOut,
  FileText,
  RotateCcw,
} from 'lucide-react';
import api, { SERVER_BASE_URL } from './services/api';
import { CustomerAuth } from './customer/CustomerAuth';
import { CustomerAccount } from './customer/CustomerAccount';
import { FloatingConcierge } from './components/FloatingConcierge';
import { PolicyModal, PolicyType } from './components/PolicyModal';
import { PinCodeChecker } from './components/PinCodeChecker';

type Category = 'Nuts' | 'Seeds' | 'Spices';
type Weight = '100g' | '250g' | '500g' | '1 gm' | '10 gm' | '29 gm' | '50 gm' | '100 gm' | string;
type BuilderKind = 'nut-mix' | 'spice-blend' | 'seed-mix';
type OriginKey = 'Goa' | 'Kashmir' | 'Kerala' | 'Bihar' | 'Rajasthan' | 'Gujarat' | 'Madhya Pradesh' | 'Uttarakhand';

type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  addresses?: any[];
};

type Product = {
  id: string;
  dbId?: string;
  name: string;
  category: Category;
  origin: string;
  description: string;
  price: string;
  rating: string;
  imagePosition: string;
  tag?: string;
  packagingKey: string;
  imageUrl?: string;
  variants?: { id?: string; weight_label: string; price: number }[];
};

type CartLine = {
  id: string;
  variantId?: string;
  name: string;
  category: string;
  origin: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
  custom?: boolean;
};

type BuilderOption = {
  id: string;
  productId: string;
  label: string;
  note: string;
};

type GiftHamper = {
  id: string;
  name: string;
  kicker: string;
  tag: string;
  occasion?: string | string[];
  price: number;
  ingredientsPrice?: number;
  boxPrice?: number;
  description: string;
  pouches: {
    name: string;
    weight: string;
    image: string;
    position: 'left' | 'center' | 'right';
  }[];
  origin: string;
};

const asset = (name: string) => {
  if (!name) return '/assets/products-official/mamra-almonds-250g.webp';
  if (name.startsWith('http') || name.startsWith('data:')) return name;
  const clean = name.replace(/^\/?(assets\/)?/, '');
  return `/assets/${clean}`;
};

const initialProducts: Product[] = [
  { id: 'almonds', name: 'Premium Mamra Almonds', category: 'Nuts', origin: 'Kashmir', description: 'Naturally sweet, dense and delicately crisp, with a rich daily-nourishment profile.', price: '₹399', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'mamra-almonds', tag: 'Bestseller', variants: [{ weight_label: '100g', price: 160 }, { weight_label: '250g', price: 399 }, { weight_label: '500g', price: 798 }] },
  { id: 'cashews', name: 'Giant Jumbo Cashews', category: 'Nuts', origin: 'Goa', description: 'Silken, ivory cashews selected for their generous size and buttery finish.', price: '₹326', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'jumbo-cashews', tag: 'Most loved', variants: [{ weight_label: '100g', price: 130 }, { weight_label: '250g', price: 326 }, { weight_label: '500g', price: 651 }] },
  { id: 'pistachios', name: 'Premium Pistachios', category: 'Nuts', origin: 'Bihar', description: 'Naturally vibrant pistachios with a crisp, sweet finish and clean bite.', price: '₹572', rating: '4.7', imagePosition: '50% 50%', packagingKey: 'pistachios', variants: [{ weight_label: '100g', price: 229 }, { weight_label: '250g', price: 572 }, { weight_label: '500g', price: 1145 }] },
  { id: 'walnuts', name: 'Cracked Snow Walnuts', category: 'Nuts', origin: 'Kashmir', description: 'Clean, rich walnut halves with a delicate crunch and high-valley depth.', price: '₹450', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'snow-walnuts' },
  { id: 'raisins', name: 'Premium Raisins', category: 'Nuts', origin: 'Maharashtra', description: 'Sun-dried raisins with a soft, honeyed sweetness and a clean finish.', price: '₹150', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'raisins', tag: 'New harvest' },
  { id: 'fox-nuts', name: 'Premium Fox Nuts (Makhana)', category: 'Nuts', origin: 'Bihar', description: 'Light, airy fox nuts with a delicate crunch and quietly satisfying nourishment.', price: '₹340', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'fox-nuts-makhana', tag: 'Bihar harvest', variants: [{ weight_label: '100g', price: 136 }, { weight_label: '250g', price: 340 }, { weight_label: '500g', price: 679 }] },
  { id: 'dry-coconut', name: 'Premium Dry Coconut', category: 'Nuts', origin: 'Kerala', description: 'Fragrant coconut pieces with a creamy richness and warm coastal character.', price: '₹580', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'dry-coconut', tag: 'Coastal harvest' },
  { id: 'himalayan-chia-seeds', name: 'Himalayan Chia Seeds', category: 'Seeds', origin: 'Uttarakhand', description: 'Tiny, mineral-rich chia seeds with a clean texture and quiet everyday nourishment.', price: '₹390', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'himalayan-chia-seeds', tag: 'Single origin' },
  { id: 'gujarat-flax-seeds', name: 'Gujarat Flax Seeds (अलसी)', category: 'Seeds', origin: 'Gujarat', description: 'Toasty flax seeds with a gentle nuttiness, selected for daily blending and baking.', price: '₹50', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'gujarat-flax-seeds', variants: [{ weight_label: '100g', price: 20 }, { weight_label: '250g', price: 50 }, { weight_label: '500g', price: 100 }] },
  { id: 'rajasthan-pumpkin-seeds', name: 'Rajasthan Pumpkin Seeds', category: 'Seeds', origin: 'Rajasthan', description: 'Green pumpkin seeds with a satisfying bite and a naturally buttery finish.', price: '₹200', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'rajasthan-pumpkin-seeds' },
  { id: 'madhya-pradesh-sunflower-seeds', name: 'Madhya Pradesh Sunflower Seeds', category: 'Seeds', origin: 'Madhya Pradesh', description: 'Crisp sunflower seeds with a warm, lightly toasted character for thoughtful snacking.', price: '₹360', rating: '4.7', imagePosition: '50% 50%', packagingKey: 'madhya-pradesh-sunflower-seeds' },
  { id: 'maharashtra-watermelon-seeds', name: 'Maharashtra Watermelon Seeds (तरबूज के बीज)', category: 'Seeds', origin: 'Maharashtra', description: 'Delicate watermelon seeds with a clean crunch and a soft, creamy finish.', price: '₹240', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'maharashtra-watermelon-seeds', variants: [{ weight_label: '100g', price: 96 }, { weight_label: '250g', price: 240 }, { weight_label: '500g', price: 480 }] },
  { id: 'tamil-nadu-sesame-seeds', name: 'Tamil Nadu Sesame Seeds', category: 'Seeds', origin: 'Tamil Nadu', description: 'Aromatic sesame seeds with a polished nuttiness and fragrant everyday lift.', price: '₹310', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'tamil-nadu-sesame-seeds' },
  { id: 'karnataka-hemp-seeds', name: 'Karnataka Hemp Seeds', category: 'Seeds', origin: 'Karnataka', description: 'Soft, nutty hemp hearts selected for their plant-powered richness and texture.', price: '₹690', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'karnataka-hemp-seeds', tag: 'Plant powered' },
  { id: 'andhra-pradesh-cumin-seeds', name: 'Andhra Pradesh Cumin Seeds', category: 'Seeds', origin: 'Andhra Pradesh', description: 'Fragrant cumin seeds with a warm, earthy character and a clean aromatic finish.', price: '₹102', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'andhra-pradesh-cumin-seeds', variants: [{ weight_label: '100g', price: 41 }, { weight_label: '250g', price: 102 }, { weight_label: '500g', price: 203 }] },
  { id: 'uttar-pradesh-fennel-seeds', name: 'Uttar Pradesh Fennel Seeds', category: 'Seeds', origin: 'Uttar Pradesh', description: 'Sweet fennel seeds with a fresh aniseed lift and a delicate, satisfying crunch.', price: '₹320', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'uttar-pradesh-fennel-seeds' },
  { id: 'kerala-basil-seeds', name: 'Kerala Basil Seeds', category: 'Seeds', origin: 'Kerala', description: 'Cooling basil seeds with a clean texture and a quietly refreshing character.', price: '₹420', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'kerala-basil-seeds', tag: 'Coastal harvest' },
  { id: 'bihar-melon-seeds', name: 'Bihar Melon Seeds', category: 'Seeds', origin: 'Bihar', description: 'Creamy melon seeds with a gentle sweetness and a rich, elegant bite.', price: '₹620', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'bihar-melon-seeds' },
  { id: 'himachal-hemp-hearts', name: 'Himachal Hemp Hearts', category: 'Seeds', origin: 'Himachal Pradesh', description: 'Tender hemp hearts with a delicate nuttiness and a nourishing, high-valley character.', price: '₹720', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'himachal-hemp-hearts', tag: 'New ritual' },
  { id: 'lakadong-turmeric', name: 'Lakadong Turmeric', category: 'Spices', origin: 'Meghalaya', description: 'A golden single-origin turmeric with deep colour, warm character and an earthy finish.', price: '₹380', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'lakadong-turmeric', tag: 'Single origin' },
  { id: 'golden-cumin', name: 'Golden Cumin', category: 'Spices', origin: 'Gujarat', description: 'Aromatic cumin with a toasted warmth, selected from Gujarat for everyday cooking.', price: '₹102', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'golden-cumin', variants: [{ weight_label: '100g', price: 41 }, { weight_label: '250g', price: 102 }, { weight_label: '500g', price: 203 }] },
  { id: 'rajasthan-coriander', name: 'Rajasthan Coriander', category: 'Spices', origin: 'Rajasthan', description: 'Bright, citrusy coriander with a gentle sweetness and clean, fragrant lift.', price: '₹360', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'rajasthan-coriander' },
  { id: 'byadgi-chilli', name: 'Byadgi Chilli', category: 'Spices', origin: 'Karnataka', description: 'A richly coloured chilli with a rounded warmth and a naturally smoky finish.', price: '₹440', rating: '4.7', imagePosition: '50% 50%', packagingKey: 'byadgi-chilli' },
  { id: 'royal-garam-masala', name: 'Royal Garam Masala', category: 'Spices', origin: 'North India', description: 'A balanced aromatic blend of whole spices, layered for a deep, elegant finish.', price: '₹520', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'royal-garam-masala', tag: 'House blend' },
  { id: 'idukki-green-cardamom', name: 'Idukki Green Cardamom', category: 'Spices', origin: 'Kerala', description: 'Cool, floral cardamom pods with a bright sweetness from the spice hills of Idukki.', price: '₹1,175', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'idukki-green-cardamom' },
  { id: 'black-cardamom', name: 'Himalayan Black Cardamom', category: 'Spices', origin: 'Sikkim', description: 'Smoky, deeply aromatic whole black cardamom pods sourced from eastern Himalayan foothills.', price: '₹375', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'black-cardamom', tag: 'Valley harvest' },
  { id: 'zanzibar-cloves', name: 'Zanzibar Cloves', category: 'Spices', origin: 'Zanzibar', description: 'Intensely fragrant whole cloves with a warm, softly sweet aromatic profile.', price: '₹368', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'zanzibar-cloves', variants: [{ weight_label: '100g', price: 147 }, { weight_label: '250g', price: 368 }, { weight_label: '500g', price: 735 }] },
  { id: 'malabar-nutmeg', name: 'Malabar Nutmeg', category: 'Spices', origin: 'Kerala', description: 'Warm, resinous nutmeg with a rounded fragrance and a quietly complex finish.', price: '₹620', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'malabar-nutmeg' },
  { id: 'himalayan-bay-leaf', name: 'Himalayan Bay Leaf', category: 'Spices', origin: 'Himalayas', description: 'Fragrant bay leaves with a soft woodiness and a high-valley sense of place.', price: '₹340', rating: '4.7', imagePosition: '50% 50%', packagingKey: 'himalayan-bay-leaf' },
  { id: 'lucknow-fennel', name: 'Lucknow Fennel', category: 'Spices', origin: 'Uttar Pradesh', description: 'Sweet, delicate fennel seeds with a fresh aniseed lift and gentle crunch.', price: '₹360', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'lucknow-fennel' },
  { id: 'ceylon-cinnamon', name: 'Ceylon Cinnamon', category: 'Spices', origin: 'Sri Lanka', description: 'Light, layered cinnamon with a delicate sweetness and a polished finish.', price: '₹480', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'ceylon-cinnamon' },
  { id: 'tellicherry-black-pepper', name: 'Tellicherry Black Pepper', category: 'Spices', origin: 'Malabar Coast', description: 'Bold, fragrant peppercorns with a bright heat and a deep coastal character.', price: '₹289', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'tellicherry-black-pepper', tag: 'Coastal harvest', variants: [{ weight_label: '100g', price: 116 }, { weight_label: '250g', price: 289 }, { weight_label: '500g', price: 578 }] },
  { id: 'kashmir-saffron', name: 'Kashmir Saffron (केसर)', category: 'Spices', origin: 'Kashmir', description: 'A precious crimson spice with a floral aroma and an unmistakably elegant finish. Sourced directly from the autumn harvest of Pampore.', price: '₹175', rating: '5.0', imagePosition: '50% 50%', packagingKey: 'kashmir-saffron', tag: 'Rare harvest', variants: [{ weight_label: '1 gm', price: 175 }, { weight_label: '10 gm', price: 1750 }, { weight_label: '29 gm', price: 5075 }, { weight_label: '50 gm', price: 8750 }, { weight_label: '100 gm', price: 17500 }] },
  { id: 'hing-asafoetida', name: 'Hing (Asafoetida)', category: 'Spices', origin: 'Varanasi', description: 'Pure compounding Hing with intense, earthy aroma and digestive warmth. Hand-pounded in traditional earthen mortars.', price: '₹600', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'hing-asafoetida', tag: 'Kitchen Royal', variants: [{ weight_label: '100g', price: 240 }, { weight_label: '250g', price: 600 }, { weight_label: '500g', price: 1200 }] },
  { id: 'chakra-phool', name: 'Chakra Phool (Star Anise)', category: 'Spices', origin: 'Kerala', description: 'Whole 8-pointed star anise pods with sweet licorice aroma and high essential oil content for royal curries and biryanis.', price: '₹300', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'chakra-phool', tag: 'Aromatic Pods', variants: [{ weight_label: '100g', price: 120 }, { weight_label: '250g', price: 300 }, { weight_label: '500g', price: 600 }] },
  { id: 'sabut-dhaniya', name: 'Sabut Dhaniya', category: 'Spices', origin: 'Rajasthan', description: 'Sun-dried golden coriander seeds from Ramganj Mandi with bright citrusy top notes and mild floral warmth.', price: '₹80', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'sabut-dhaniya', tag: 'Pure Harvest', variants: [{ weight_label: '100g', price: 35 }, { weight_label: '250g', price: 80 }, { weight_label: '500g', price: 160 }] },
  { id: 'saunf', name: 'Saunf', category: 'Spices', origin: 'Lucknow', description: 'Extra bold Lucknow sweet fennel seeds, hand-cleaned for soothing after-meal ritual and delicate sweetness.', price: '₹120', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'saunf', tag: 'After-Meal Ritual', variants: [{ weight_label: '100g', price: 50 }, { weight_label: '250g', price: 120 }, { weight_label: '500g', price: 240 }] },
  { id: 'panch-phoron', name: 'Panch Phoron', category: 'Spices', origin: 'Bengal', description: 'The authentic five-spice blend of cumin, brown mustard, fenugreek, nigella, and fennel in balanced traditional proportions.', price: '₹130', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'panch-phoron', tag: 'Heritage Blend', variants: [{ weight_label: '100g', price: 55 }, { weight_label: '250g', price: 130 }, { weight_label: '500g', price: 260 }] },
  { id: 'aamchur', name: 'Aamchur', category: 'Spices', origin: 'Uttar Pradesh', description: 'Tart, sun-dried raw green mango powder ground to a fine velvety texture for gentle fruit acidity.', price: '₹115', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'aamchur', tag: 'Sun Dried', variants: [{ weight_label: '100g', price: 48 }, { weight_label: '250g', price: 115 }, { weight_label: '500g', price: 230 }] },
  { id: 'kabab-chini', name: 'Kabab Chini', category: 'Spices', origin: 'Malabar Coast', description: 'Tailed cubeb peppercorns with camphorous, peppery warmth and subtle clove undertones.', price: '₹400', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'kabab-chini', tag: 'Royal Spice', variants: [{ weight_label: '100g', price: 160 }, { weight_label: '250g', price: 400 }, { weight_label: '500g', price: 800 }] },
  { id: 'siyajira', name: 'Siyajira', category: 'Spices', origin: 'Kashmir', description: 'Wild-harvested dark mountain caraway / shahi jeera with delicate smoky fragrance and royal subtlety.', price: '₹350', rating: '5.0', imagePosition: '50% 50%', packagingKey: 'siyajira', tag: 'Wild Mountain', variants: [{ weight_label: '100g', price: 140 }, { weight_label: '250g', price: 350 }, { weight_label: '500g', price: 700 }] },
  { id: 'javitri', name: 'Javitri (Mace)', category: 'Spices', origin: 'Kerala', description: 'Hand-peeled golden-crimson mace blades with elegant bittersweet fragrance and luminous warmth.', price: '₹813', rating: '5.0', imagePosition: '50% 50%', packagingKey: 'javitri', tag: 'Crimson Blades', variants: [{ weight_label: '100g', price: 325 }, { weight_label: '250g', price: 813 }, { weight_label: '500g', price: 1625 }] },
  { id: 'imali', name: 'Imali (Tamarind)', category: 'Spices', origin: 'Karnataka', description: 'Tangy, sun-ripened whole tamarind with rich natural pulp, perfect for traditional Indian curries, chutneys, and rasam.', price: '₹45', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'imali', tag: 'Pure Pulp', variants: [{ weight_label: '100g', price: 18 }, { weight_label: '250g', price: 45 }, { weight_label: '500g', price: 90 }] },
  { id: 'khajur', name: 'Khajur', category: 'Nuts', origin: 'Oman', description: 'Plump, velvety natural gourmet dates with caramel-like sweetness and rich natural dietary fibre.', price: '₹170', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'khajur', tag: 'Velvet Sweetness', variants: [{ weight_label: '100g', price: 70 }, { weight_label: '250g', price: 170 }, { weight_label: '500g', price: 340 }] },
  { id: 'anjir', name: 'Anjir', category: 'Nuts', origin: 'Kashmir', description: 'Hand-strung sun-dried golden royal figs packed with minerals, honeyed crunch, and deep fruit character.', price: '₹375', rating: '5.0', imagePosition: '50% 50%', packagingKey: 'anjir', tag: 'Royal Figs', variants: [{ weight_label: '100g', price: 150 }, { weight_label: '250g', price: 375 }, { weight_label: '500g', price: 750 }] },
  { id: 'mungfali', name: 'Mungfali', category: 'Nuts', origin: 'Gujarat', description: 'Extra-bold Saurashtra groundnuts / peanuts with high natural oil content and crunchy natural creaminess.', price: '₹60', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'mungfali', tag: 'Saurashtra Bold', variants: [{ weight_label: '100g', price: 28 }, { weight_label: '250g', price: 60 }, { weight_label: '500g', price: 120 }] },
  { id: 'safed-mirch', name: 'Safed Mirch', category: 'Spices', origin: 'Kerala', description: 'Fully ripened peppercorns with the dark skin removed, offering sharp clean heat and subtle fermented aroma.', price: '₹350', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'safed-mirch', tag: 'Pristine Heat', variants: [{ weight_label: '100g', price: 140 }, { weight_label: '250g', price: 350 }, { weight_label: '500g', price: 700 }] },
  { id: 'dalchini-paper', name: 'Dalchini (Paper)', category: 'Spices', origin: 'Kerala', description: 'Delicate paper-thin true quill cinnamon rolls with sweet fragrant perfume and zero pungent bite.', price: '₹240', rating: '4.9', imagePosition: '50% 50%', packagingKey: 'dalchini-paper', tag: 'Paper Quill', variants: [{ weight_label: '100g', price: 100 }, { weight_label: '250g', price: 240 }, { weight_label: '500g', price: 480 }] },
  { id: 'rai', name: 'Rai', category: 'Spices', origin: 'Rajasthan', description: 'Tiny pungent small mustard seeds that pop with nutty aroma and sharp heat in traditional tempering.', price: '₹45', rating: '4.8', imagePosition: '50% 50%', packagingKey: 'rai', tag: 'Sharp Tempering', variants: [{ weight_label: '100g', price: 20 }, { weight_label: '250g', price: 45 }, { weight_label: '500g', price: 90 }] },
  { id: 'posta-dana', name: 'Posta Dana', category: 'Seeds', origin: 'Madhya Pradesh', description: 'Creamy ivory poppy seeds (Khus Khus) revered for cooling richness, royal gravies, and traditional sweets.', price: '₹450', rating: '5.0', imagePosition: '50% 50%', packagingKey: 'posta-dana', tag: 'Ivory Pearls', variants: [{ weight_label: '100g', price: 180 }, { weight_label: '250g', price: 450 }, { weight_label: '500g', price: 900 }] },
];

let globalCatalogue: Product[] = initialProducts;

const weights: { label: Weight; multiplier: number }[] = [
  { label: '100g', multiplier: 0.10 },
  { label: '250g', multiplier: 0.25 },
  { label: '500g', multiplier: 0.50 },
];

const giftHampers: GiftHamper[] = [
  {
    id: 'gift-shubh-aarambh',
    name: 'The Shubh Aarambh Trio Nut Box',
    kicker: '01 · Festive & Housewarming Edition',
    tag: 'Bestseller Box · ₹400',
    occasion: ['festive', 'affordable'],
    price: 400,
    ingredientsPrice: 350,
    boxPrice: 50,
    description: 'An aesthetic handcrafted rigid presentation hamper in signature NAAVORI royal plum & antique gold foil. Features premium Mamra Almonds (100g = ₹160), Jumbo Cashews (100g = ₹130), and sweet Golden Raisins (100g = ₹60) with celebratory satin ribbon. Includes ₹50 luxury rigid gift box packaging.',
    origin: 'Kashmir, Goa & Maharashtra',
    pouches: [
      { name: 'Jumbo Cashews', weight: '100g', image: 'products-official/jumbo-cashews-100g.webp', position: 'left' },
      { name: 'Mamra Almonds', weight: '100g', image: 'products-official/mamra-almonds-100g.webp', position: 'center' },
      { name: 'Golden Raisins', weight: '100g', image: 'products-official/raisins-100g.webp', position: 'right' },
    ],
  },
  {
    id: 'gift-utsav-celebration',
    name: 'The Classic Four Nuts Hamper Box',
    kicker: '02 · Everyday Celebration Edition',
    tag: 'Celebration Box · Under ₹1200',
    occasion: ['festive', 'affordable', 'birthday'],
    price: 629,
    ingredientsPrice: 579,
    boxPrice: 50,
    description: 'A delightful 4-nut celebration gift box. Premium Pistachios (100g = ₹229), royal Mamra Almonds (100g = ₹160), Jumbo Cashews (100g = ₹130), and sun-dried Raisins (100g = ₹60) in signature stand-up pouches within our handcrafted plum & gold gift box. Includes ₹50 luxury rigid gift box packaging.',
    origin: 'Kashmir, Goa & Bihar',
    pouches: [
      { name: 'Jumbo Cashews', weight: '100g', image: 'products-official/jumbo-cashews-100g.webp', position: 'left' },
      { name: 'Mamra Almonds', weight: '100g', image: 'products-official/mamra-almonds-100g.webp', position: 'center' },
      { name: 'Pistachios', weight: '100g', image: 'products-official/pistachios-100g.webp', position: 'right' },
    ],
  },
  {
    id: 'gift-corporate',
    name: 'The Executive Corporate Nut Treasury',
    kicker: '03 · Corporate & Executive Edition',
    tag: 'Corporate Gifting · ₹1,347',
    occasion: ['corporate'],
    price: 1347,
    ingredientsPrice: 1297,
    boxPrice: 50,
    description: 'Specially crafted for executive clientele, boardrooms, and esteemed corporate partners. Giant Jumbo Cashews (250g = ₹326), Mamra Almonds (250g = ₹399), and sweet Pistachios (250g = ₹572) in airtight pouches within our embossed corporate presentation gift box. Includes ₹50 luxury rigid gift box packaging.',
    origin: 'Goa, Kashmir & Bihar',
    pouches: [
      { name: 'Jumbo Cashews', weight: '250g', image: 'products-official/jumbo-cashews-250g.webp', position: 'left' },
      { name: 'Mamra Almonds', weight: '250g', image: 'products-official/mamra-almonds-250g.webp', position: 'center' },
      { name: 'Pistachios', weight: '250g', image: 'products-official/pistachios-250g.webp', position: 'right' },
    ],
  },
  {
    id: 'gift-wedding',
    name: 'The Royal Shahi Wedding Nut Hamper',
    kicker: '04 · Shahi Vivah & Ceremonial Edition',
    tag: 'Wedding Gifting · ₹1,797',
    occasion: ['wedding'],
    price: 1797,
    ingredientsPrice: 1747,
    boxPrice: 50,
    description: 'Traditional auspicious wedding curation for matrimonial ceremonies, royal receptions, and family celebrations. 100% pure gourmet nuts: Mamra Almonds (250g = ₹399), Jumbo Cashews (250g = ₹326), Kashmiri Snow Walnuts (250g = ₹450), and vibrant Pistachios (250g = ₹572) in a bespoke gold-foiled rigid chest. Includes ₹50 luxury rigid gift box packaging.',
    origin: 'Kashmir Valley, Goa & Bihar',
    pouches: [
      { name: 'Jumbo Cashews', weight: '250g', image: 'products-official/jumbo-cashews-250g.webp', position: 'left' },
      { name: 'Mamra Almonds', weight: '250g', image: 'products-official/mamra-almonds-250g.webp', position: 'center' },
      { name: 'Snow Walnuts', weight: '250g', image: 'products-official/snow-walnuts-250g.webp', position: 'right' },
    ],
  },
  {
    id: 'gift-birthday',
    name: 'The Celebration Birthday Nut Box',
    kicker: '05 · Birthday & Joyful Moments Edition',
    tag: 'Birthday Special · ₹1,265',
    occasion: ['birthday'],
    price: 1265,
    ingredientsPrice: 1215,
    boxPrice: 50,
    description: 'A cheerful, nutritious birthday surprise gift box. Bihar Fox Nuts / Makhana (250g = ₹340), crunchy royal Mamra Almonds (250g = ₹399), golden Jumbo Cashews (250g = ₹326), and sweet sun-dried Raisins (250g = ₹150) in celebratory pouches inside a luxury gift box. Includes ₹50 luxury rigid gift box packaging.',
    origin: 'Bihar, Kashmir, Goa & Maharashtra',
    pouches: [
      { name: 'Fox Nuts (Makhana)', weight: '250g', image: 'products-official/fox-nuts-makhana-250g.webp', position: 'left' },
      { name: 'Mamra Almonds', weight: '250g', image: 'products-official/mamra-almonds-250g.webp', position: 'center' },
      { name: 'Jumbo Cashews', weight: '250g', image: 'products-official/jumbo-cashews-250g.webp', position: 'right' },
    ],
  },
  {
    id: 'gift-vitality-prana',
    name: 'The Wellness Nut & Makhana Treasury',
    kicker: '06 · Holistic Health & Prana Edition',
    tag: 'Wellness Nut Edition · ₹1,239',
    occasion: ['wellness'],
    price: 1239,
    ingredientsPrice: 1189,
    boxPrice: 50,
    description: 'Pure, nutrient-dense natural nourishment. Light airy Bihar Makhana (250g = ₹340), dense high-valley Kashmiri Mamra Almonds (250g = ₹399), and brain-nourishing Snow Walnuts (250g = ₹450) sealed for freshness in our signature wellness gift box. Includes ₹50 luxury rigid gift box packaging.',
    origin: 'Bihar & Kashmir Valley',
    pouches: [
      { name: 'Fox Nuts (Makhana)', weight: '250g', image: 'products-official/fox-nuts-makhana-250g.webp', position: 'left' },
      { name: 'Mamra Almonds', weight: '250g', image: 'products-official/mamra-almonds-250g.webp', position: 'center' },
      { name: 'Snow Walnuts', weight: '250g', image: 'products-official/snow-walnuts-250g.webp', position: 'right' },
    ],
  },
  {
    id: 'gift-grand-panchratna',
    name: 'The Grand Panch-Ratna 5-Nuts Royal Chest',
    kicker: '07 · Royal 5-Nuts Grand Edition',
    tag: 'Grand Luxury · 5 Royal Nuts · ₹2,137',
    occasion: ['wedding', 'corporate'],
    price: 2137,
    ingredientsPrice: 2087,
    boxPrice: 50,
    description: 'The ultimate 5-nuts royal gift presentation. An extravagant assortment of Mamra Almonds (250g = ₹399), Jumbo Cashews (250g = ₹326), Pistachios (250g = ₹572), Snow Walnuts (250g = ₹450), and Fox Nuts Makhana (250g = ₹340) in an opulent keepsake presentation box. Includes ₹50 luxury rigid gift box packaging.',
    origin: 'Kashmir, Goa & Bihar',
    pouches: [
      { name: 'Mamra Almonds', weight: '250g', image: 'products-official/mamra-almonds-250g.webp', position: 'left' },
      { name: 'Pistachios', weight: '250g', image: 'products-official/pistachios-250g.webp', position: 'center' },
      { name: 'Jumbo Cashews', weight: '250g', image: 'products-official/jumbo-cashews-250g.webp', position: 'right' },
    ],
  },
];

const slugPackagingMap: Record<string, string> = {
  'kashmir-walnut': 'snow-walnuts',
  'walnuts': 'snow-walnuts',
  'cracked-snow-walnuts': 'snow-walnuts',
  'premium-cashew': 'jumbo-cashews',
  'cashews': 'jumbo-cashews',
  'giant-jumbo-cashews': 'jumbo-cashews',
  'almonds': 'mamra-almonds',
  'premium-mamra-almonds': 'mamra-almonds',
  'pistachios': 'pistachios',
  'premium-pistachios': 'pistachios',
  'fox-nuts': 'fox-nuts-makhana',
  'fox-nuts-makhana': 'fox-nuts-makhana',
  'premium-fox-nuts-(makhana)': 'fox-nuts-makhana',
  'raisins': 'raisins',
  'premium-raisins': 'raisins',
  'dry-coconut': 'dry-coconut',
  'premium-dry-coconut': 'dry-coconut',
  'pepper': 'tellicherry-black-pepper',
  'tellicherry-black-pepper': 'tellicherry-black-pepper',
  'cloves': 'zanzibar-cloves',
  'zanzibar-cloves': 'zanzibar-cloves',
  'cumin': 'golden-cumin',
  'golden-cumin': 'golden-cumin',
  'hing-asafoetida': 'hing-asafoetida',
  'hing': 'hing-asafoetida',
  'asafoetida': 'hing-asafoetida',
  'chakra-phool': 'chakra-phool',
  'star-anise': 'chakra-phool',
  'sabut-dhaniya': 'sabut-dhaniya',
  'dhaniya': 'sabut-dhaniya',
  'saunf': 'saunf',
  'fennel': 'saunf',
  'panch-phoron': 'panch-phoron',
  'aamchur': 'aamchur',
  'dry-mango': 'aamchur',
  'kabab-chini': 'kabab-chini',
  'siyajira': 'siyajira',
  'shahi-jeera': 'siyajira',
  'javitri': 'javitri',
  'mace': 'javitri',
  'javitri-(mace)': 'javitri',
  'javitri-mace': 'javitri',
  'imali': 'imali',
  'imli': 'imali',
  'tamarind': 'imali',
  'imali-(tamarind)': 'imali',
  'khajur': 'khajur',
  'dates': 'khajur',
  'anjir': 'anjir',
  'figs': 'anjir',
  'mungfali': 'mungfali',
  'peanuts': 'mungfali',
  'safed-mirch': 'safed-mirch',
  'white-pepper': 'safed-mirch',
  'dalchini-paper': 'dalchini-paper',
  'paper-cinnamon': 'dalchini-paper',
  'rai': 'rai',
  'mustard-seeds': 'rai',
  'posta-dana': 'posta-dana',
  'poppy-seeds': 'posta-dana',
  'khus-khus': 'posta-dana',
};

const defaultFallbackPouch = (category?: string) => {
  if (category === 'Spices') return asset('products-spices/tellicherry-black-pepper-250g.webp');
  if (category === 'Seeds') return asset('products-seeds/rajasthan-pumpkin-seeds-250g.webp');
  return asset('products-official/mamra-almonds-250g.webp');
};

const productImage = (product: Product, weight: Weight = '250g') => {
  if (product.imageUrl) {
    if (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/uploads') || product.imageUrl.startsWith('data:')) {
      return product.imageUrl.startsWith('/uploads') ? `${SERVER_BASE_URL}${product.imageUrl}` : product.imageUrl;
    }
    return asset(product.imageUrl);
  }

  // Check if it's a gift hamper
  const cleanId = (product.id || '').toLowerCase();
  const cleanKey = (product.packagingKey || '').toLowerCase();
  const cleanName = (product.name || '').toLowerCase();
  if (cleanId.startsWith('gift-') || cleanKey.startsWith('gift-') || cleanName.includes('hamper') || cleanName.includes('box') || cleanName.includes('chest')) {
    const hamper = giftHampers.find(g => 
      g.id === product.id || 
      g.id === product.packagingKey || 
      cleanName.includes(g.name.toLowerCase()) || 
      g.name.toLowerCase().includes(cleanName)
    );
    if (hamper && hamper.pouches?.[0]?.image) {
      return asset(hamper.pouches[0].image);
    }
    return asset('products-official/mamra-almonds-250g.webp');
  }

  const rawKey = (product.packagingKey || product.id || 'mamra-almonds').toLowerCase().replace(/\s+/g, '-');
  const key = slugPackagingMap[rawKey] || rawKey;

  if (key === 'kashmir-saffron' || rawKey.includes('saffron') || cleanName.includes('saffron') || cleanName.includes('केसर')) {
    const effectiveWeight = (!weight || weight === '250g') ? '1 gm' : weight;
    const cleanW = effectiveWeight.toLowerCase().replace(/\s+/g, '');
    return asset(`products-spices/kashmir-saffron-${cleanW}.webp`);
  }

  const imgWeight = weight === '500g' ? '500g' : weight === '100g' ? '100g' : '250g';
  const folder = product.category === 'Spices' ? 'products-spices' : product.category === 'Seeds' ? 'products-seeds' : 'products-official';
  return asset(`${folder}/${key}-${imgWeight}.webp`);
};
const numericPrice = (price: string) => Number(price.replace(/[^0-9]/g, ''));
const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;
const findProduct = (id: string) => {
  if (!id) return undefined;
  const clean = id.toLowerCase().trim();
  return (
    globalCatalogue.find((p) => p.id === id || p.packagingKey === id || p.dbId === id) ||
    globalCatalogue.find((p) => p.id?.toLowerCase() === clean || p.packagingKey?.toLowerCase() === clean) ||
    globalCatalogue.find((p) => (p.packagingKey && (clean.includes(p.packagingKey.toLowerCase()) || p.packagingKey.toLowerCase().includes(clean))) || (p.id && (clean.includes(p.id.toLowerCase()) || p.id.toLowerCase().includes(clean))) || p.name.toLowerCase().includes(clean)) ||
    initialProducts.find((p) => p.id === id || p.packagingKey === id || p.id?.toLowerCase() === clean || p.packagingKey?.toLowerCase() === clean || (p.packagingKey && (clean.includes(p.packagingKey.toLowerCase()) || p.packagingKey.toLowerCase().includes(clean))) || p.name.toLowerCase().includes(clean))
  );
};

const origins: Record<OriginKey, { region: string; title: string; copy: string; coordinates: string; products: string[]; image: string; ingredients: string[] }> = {
  Goa: { region: 'West coast · 15°29′N', title: 'Salt air, sun-warmed harvests.', copy: 'A coastal palette of cashews, coconut and fragrant botanicals, sourced from small growers close to the Arabian Sea.', coordinates: '15.2993° N, 74.1240° E', products: ['Giant Jumbo Cashews', 'Premium Dry Coconut'], image: 'compositions/category-nuts.webp', ingredients: ['Cashew', 'Coconut', 'Warm botanicals'] },
  Kashmir: { region: 'Northern valley · 34°05′N', title: 'High valleys, quiet richness.', copy: 'Cooler days and old orchards create walnuts, almonds and saffron with unmistakable depth of flavour.', coordinates: '34.0837° N, 74.7973° E', products: ['Cracked Snow Walnuts', 'Premium Mamra Almonds', 'Kashmir Saffron'], image: 'compositions/category-nuts.webp', ingredients: ['Walnuts', 'Almonds', 'Saffron'] },
  Kerala: { region: 'Spice coast · 10°51′N', title: 'Where spice becomes ritual.', copy: 'A humid, fertile coast where coconut, pepper, cardamom and seed crops are grown slowly and handled with care.', coordinates: '10.8505° N, 76.2711° E', products: ['Premium Dry Coconut', 'Idukki Green Cardamom', 'Tellicherry Black Pepper'], image: 'compositions/category-spices.webp', ingredients: ['Coconut', 'Black pepper', 'Cardamom'] },
  Bihar: { region: 'Eastern plains · 25°36′N', title: 'Generous soil, heirloom goodness.', copy: 'Rich alluvial soil and patient cultivation shape a quietly generous pantry of fox nuts and creamy seeds.', coordinates: '25.0961° N, 85.3131° E', products: ['Premium Fox Nuts (Makhana)', 'Bihar Melon Seeds'], image: 'compositions/category-seeds.webp', ingredients: ['Makhana', 'Melon seeds', 'Mustard'] },
  Rajasthan: { region: 'Desert bloom · 27°01′N', title: 'Sunlit fields, aromatic harvests.', copy: 'A dry, luminous landscape where seeds and spice develop concentrated character.', coordinates: '27.0238° N, 74.2179° E', products: ['Rajasthan Pumpkin Seeds', 'Rajasthan Coriander'], image: 'compositions/category-spices.webp', ingredients: ['Cumin', 'Coriander', 'Pumpkin seeds'] },
  Gujarat: { region: 'Western plains · 22°15′N', title: 'A polished, nutty signature.', copy: 'Warm soil and careful selection give Gujarat its bright, toasty pantry language.', coordinates: '22.2587° N, 71.1924° E', products: ['Gujarat Flax Seeds', 'Golden Cumin'], image: 'compositions/category-seeds.webp', ingredients: ['Sesame', 'Flax', 'Cumin'] },
  'Madhya Pradesh': { region: 'Central India · 23°28′N', title: 'The heartland of harvest.', copy: 'Open fields and steady hands shape seeds with clean flavour and confident texture.', coordinates: '23.4733° N, 77.9470° E', products: ['Madhya Pradesh Sunflower Seeds'], image: 'compositions/category-seeds.webp', ingredients: ['Sunflower seeds', 'Coriander', 'Wheat'] },
  Uttarakhand: { region: 'Himalayan foothills · 30°06′N', title: 'A clear, high-altitude rhythm.', copy: 'Mountain air and slower growing seasons create ingredients with clarity and lift.', coordinates: '30.0668° N, 79.0193° E', products: ['Himalayan Chia Seeds'], image: 'compositions/category-seeds.webp', ingredients: ['Chia', 'Mountain herbs', 'Wild botanicals'] },
};

const reasons = [
  { icon: Sprout, eyebrow: '01', title: 'Hand selected origins', copy: 'Every harvest is chosen for provenance, flavour, texture and the story it carries.' },
  { icon: Leaf, eyebrow: '02', title: 'Single origin ingredients', copy: 'No anonymous blends. We keep the character of each region visible and expressive.' },
  { icon: ShieldCheck, eyebrow: '03', title: '100% natural', copy: 'No chemicals, no artificial preservatives — just careful handling and a clean finish.' },
  { icon: BadgeCheck, eyebrow: '04', title: 'Premium quality control', copy: 'A quiet, rigorous standard from first selection to final seal, batch after batch.' },
  { icon: PackageCheck, eyebrow: '05', title: 'Farm to table', copy: 'Direct relationships, small batches and luxury packaging that protects what matters.' },
  { icon: Sparkles, eyebrow: '06', title: 'Authentic taste', copy: 'Nutrient dense, carefully curated and made for a more generous everyday ritual.' },
];

const defaultTestimonials = [
  { quote: 'The packaging is gorgeous, but the flavour is what keeps me coming back. It feels like a considered ritual, not a snack.', name: 'Ananya Mehta', role: 'Bengaluru · verified customer' },
  { quote: 'NAAVORI makes the pantry feel ceremonial. The Kashmir walnuts are impossibly fresh and the detail is exceptional.', name: 'Rohan Kapoor', role: 'Mumbai · verified customer' },
  { quote: 'A beautiful expression of Indian provenance. The spiced medley is my new desk-side essential.', name: 'Mira Shah', role: 'New Delhi · verified customer' },
];

const builderData: Record<BuilderKind, { label: string; title: string; copy: string; kicker: string; image: string; options: BuilderOption[] }> = {
  'nut-mix': {
    label: 'Nut mix', title: 'Build your own nut mix.', copy: 'Compose a personal pantry ritual from hand-selected nuts, orchard fruit and toasted coastal notes.', kicker: '01 · The custom nut edit', image: 'products-official/mamra-almonds-250g.webp',
    options: [
      { id: 'almonds', productId: 'mamra-almonds', label: 'Mamra Almonds', note: 'Kashmir · crisp' },
      { id: 'cashews', productId: 'jumbo-cashews', label: 'Jumbo Cashews', note: 'Goa · buttery' },
      { id: 'pistachios', productId: 'pistachios', label: 'Pistachios', note: 'Bihar · sweet' },
      { id: 'walnuts', productId: 'snow-walnuts', label: 'Snow Walnuts', note: 'Kashmir · rich' },
      { id: 'raisins', productId: 'raisins', label: 'Premium Raisins', note: 'Maharashtra · honeyed' },
      { id: 'fox-nuts', productId: 'fox-nuts-makhana', label: 'Fox Nuts', note: 'Bihar · airy' },
      { id: 'dry-coconut', productId: 'dry-coconut', label: 'Dry Coconut', note: 'Kerala · fragrant' },
    ],
  },
  'spice-blend': {
    label: 'Spice blend', title: 'Build your own spice blend.', copy: 'Layer whole spices into a custom aromatic signature for tables, gifting and slow cooking.', kicker: '02 · The custom spice edit', image: 'products-spices/tellicherry-black-pepper-250g.webp',
    options: [
      { id: 'pepper', productId: 'tellicherry-black-pepper', label: 'Black Pepper', note: 'Malabar · bold' }, { id: 'cardamom', productId: 'idukki-green-cardamom', label: 'Green Cardamom', note: 'Kerala · floral' }, { id: 'cloves', productId: 'zanzibar-cloves', label: 'Whole Cloves', note: 'Zanzibar · warm' }, { id: 'cinnamon', productId: 'ceylon-cinnamon', label: 'Ceylon Cinnamon', note: 'Sri Lanka · light' }, { id: 'nutmeg', productId: 'malabar-nutmeg', label: 'Malabar Nutmeg', note: 'Kerala · resinous' }, { id: 'star-anise', productId: 'royal-garam-masala', label: 'Star Anise Blend', note: 'North India · layered' }, { id: 'cumin', productId: 'golden-cumin', label: 'Golden Cumin', note: 'Gujarat · toasted' },
    ],
  },
  'seed-mix': {
    label: 'Seed mix', title: 'Build your own seed mix.', copy: 'Bring together mineral-rich seeds from India’s fields for a bright, plant-powered everyday blend.', kicker: '03 · The custom seed edit', image: 'products-seeds/rajasthan-pumpkin-seeds-250g.webp',
    options: [
      { id: 'pumpkin', productId: 'rajasthan-pumpkin-seeds', label: 'Pumpkin Seeds', note: 'Rajasthan · buttery' }, { id: 'sunflower', productId: 'madhya-pradesh-sunflower-seeds', label: 'Sunflower Seeds', note: 'Madhya Pradesh · crisp' }, { id: 'melon', productId: 'bihar-melon-seeds', label: 'Melon Seeds', note: 'Bihar · creamy' }, { id: 'flax', productId: 'gujarat-flax-seeds', label: 'Flax Seeds', note: 'Gujarat · toasty' }, { id: 'chia', productId: 'himalayan-chia-seeds', label: 'Chia Seeds', note: 'Uttarakhand · mineral' }, { id: 'sesame', productId: 'tamil-nadu-sesame-seeds', label: 'Sesame Seeds', note: 'Tamil Nadu · nutty' }, { id: 'watermelon', productId: 'maharashtra-watermelon-seeds', label: 'Watermelon Seeds', note: 'Maharashtra · delicate' },
    ],
  },
};

function LogoImage({ light = false }: { light?: boolean }) {
  return <img className={`logo-image ${light ? 'logo-image--light' : ''}`} src={asset('naavori-logo-transparent.png')} alt="NAAVORI NUTS" decoding="async" />;
}

function LoadingScreen({ done }: { done: boolean }) {
  return <div className={`loader ${done ? 'loader--done' : ''}`} aria-hidden={done}><div className="loader__halo" /><LogoImage light /><span className="loader__line" /><p>Origins of the exotic</p></div>;
}

function ProductImage({ product, eager = false, weight = '250g' as Weight }: { product: Product; eager?: boolean; weight?: Weight }) {
  return (
    <div className="product-image product-image--real" style={{ backgroundPosition: product.imagePosition }}>
      <img
        src={productImage(product, weight)}
        alt={`${product.name} NAAVORI packaging`}
        loading={eager ? 'eager' : 'lazy'}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = defaultFallbackPouch(product.category);
        }}
      />
      <span className="product-image__wash" />
    </div>
  );
}

function ProductCard({ product, liked, onLike, onCart, onBuy, onQuickView }: { product: Product; liked: boolean; onLike: () => void; onCart: () => void; onBuy: () => void; onQuickView: () => void }) {
  const displayWeightLabel = product.variants?.find(v => `₹${Math.round(v.price).toLocaleString('en-IN')}` === product.price)?.weight_label || product.variants?.[0]?.weight_label || '250 g';
  return <article className="product-card" data-reveal>
    <button className={`wish-button ${liked ? 'wish-button--active' : ''}`} onClick={onLike} aria-label={`${liked ? 'Remove' : 'Add'} ${product.name} ${liked ? 'from' : 'to'} wishlist`}><Heart size={16} fill={liked ? 'currentColor' : 'none'} /></button>
    <button className="product-card__visual" onClick={onQuickView} aria-label={`View details for ${product.name}`}>
      {product.tag && <span className="product-card__tag">{product.tag}</span>}
      <ProductImage product={product} />
      <span className="quick-view">View details <ArrowUpRight size={14} /></span>
    </button>
    <div className="product-card__meta"><div className="product-card__title-row"><div><p className="eyebrow">{product.category} · {product.origin}</p><h3>{product.name}</h3></div><span className="product-rating">★ {product.rating}</span></div><p className="product-card__description">{product.description}</p><div className="product-card__bottom"><div><strong>{product.price}</strong><small className="product-card__weight">{displayWeightLabel} · Premium quality</small></div><div className="product-card__actions"><button className="text-button" onClick={onCart}>Add to cart <ArrowUpRight size={14} /></button><button className="text-button text-button--secondary" onClick={onBuy}>Buy now <ArrowUpRight size={14} /></button></div></div></div>
  </article>;
}

function ProductDetailPage({ product, liked, toggleWishlist, addToCart, navigate }: { product: Product; liked: boolean; toggleWishlist: () => void; addToCart: (product: Product, weight?: Weight, quantity?: number) => void; navigate: (path: string) => void }) {
  const cleanId = (product.id || '').toLowerCase();
  const cleanKey = (product.packagingKey || '').toLowerCase();
  const cleanName = (product.name || '').toLowerCase();
  const isSaffron = cleanId.includes('saffron') || cleanKey.includes('saffron') || cleanName.includes('saffron') || cleanName.includes('केसर');

  const saffronOptions = [
    { label: '1 gm', multiplier: 1, grams: 1 },
    { label: '10 gm', multiplier: 10, grams: 10 },
    { label: '29 gm', multiplier: 29, grams: 29 },
    { label: '50 gm', multiplier: 50, grams: 50 },
    { label: '100 gm', multiplier: 100, grams: 100 },
  ];

  const [weight, setWeight] = useState<Weight>(() => isSaffron ? '1 gm' : '250g');
  const [quantity, setQuantity] = useState(1);
  const [gallery, setGallery] = useState(0);

  useEffect(() => {
    setWeight(isSaffron ? '1 gm' : '250g');
    setGallery(0);
  }, [product.id, isSaffron]);

  const isHamper = cleanId.startsWith('gift-') || cleanKey.startsWith('gift-') || cleanName.includes('hamper') || cleanName.includes('box') || cleanName.includes('chest');
  const hamper = isHamper ? giftHampers.find(g => g.id === product.id || g.id === product.packagingKey || cleanName.includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(cleanName)) : null;

  const selectedWeight = weights.find((item) => item.label === weight) ?? weights[1];
  
  const variantPrice = product.variants?.find(v => v.weight_label === weight)?.price;
  const saffronGrams = isSaffron ? (parseInt(weight.replace(/[^0-9]/g, '')) || 1) : 1;
  const basePrice = hamper ? hamper.price : (variantPrice ? variantPrice : (isSaffron ? saffronGrams * 175 : Math.round(numericPrice(product.price) * (selectedWeight.multiplier / 0.25))));
  const total = basePrice * quantity;
  
  const galleryImages = hamper
    ? hamper.pouches.map((p) => asset(p.image))
    : isSaffron
      ? saffronOptions.map(({ label }) => productImage(product, label))
      : weights.map(({ label }) => productImage(product, label));

  const shareProduct = () => { void navigator.clipboard?.writeText(window.location.href); };
  const benefits = product.category === 'Nuts' ? ['Rich in protein', 'High in vitamin E', 'Heart healthy', 'Natural energy source'] : product.category === 'Seeds' ? ['Mineral rich', 'High fibre', 'Plant-powered goodness', 'Daily nourishment'] : ['Naturally aromatic', 'Antioxidant rich', 'Warming character', 'Kitchen essential'];

  return (
    <main className="product-detail">
      <button className="product-detail__back" onClick={() => navigate('/shop')}>
        <ArrowLeft size={15} /> Back to the collection
      </button>
      <div className="product-detail__layout">
        <section className="product-gallery" aria-label={`${product.name} image gallery`}>
          <div className="product-gallery__main">
            <img
              src={galleryImages[gallery] || galleryImages[0] || defaultFallbackPouch(product.category)}
              alt={`${product.name} packaging`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultFallbackPouch(product.category);
              }}
            />
            <span className="product-gallery__zoom">Hover to explore</span>
          </div>
          <div className="product-gallery__thumbs">
            {galleryImages.map((image, index) => (
              <button
                key={image + index}
                className={gallery === index ? 'is-active' : ''}
                onClick={() => {
                  setGallery(index);
                  if (!hamper) {
                    if (isSaffron && saffronOptions[index]) {
                      setWeight(saffronOptions[index].label);
                    } else if (weights[index]) {
                      setWeight(weights[index].label);
                    }
                  }
                }}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultFallbackPouch(product.category);
                  }}
                />
                <small>{hamper ? hamper.pouches[index]?.weight || `Pouch ${index + 1}` : (isSaffron ? saffronOptions[index]?.label : weights[index]?.label)}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="product-detail__copy">
          <p className="eyebrow">{product.category} · {product.origin} · selected quality</p>
          <div className="product-detail__title-row">
            <h1>{product.name}</h1>
            <div className="detail-actions">
              <button className={`detail-wish ${liked ? 'is-active' : ''}`} onClick={toggleWishlist} aria-label="Wishlist product">
                <Heart size={19} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button className="detail-share" onClick={shareProduct}>Share</button>
            </div>
          </div>
          <div className="product-detail__rating">
            <span>★ {product.rating}</span>
            <span>·</span>
            <span>128 verified reviews</span>
            <span className="product-detail__badge"><BadgeCheck size={14} /> Premium</span>
          </div>
          <p className="product-detail__lede">
            {hamper ? hamper.description : `${product.description} Thoughtfully selected and freshly sealed for a more generous everyday.`}
          </p>

          {hamper && (
            <div style={{ margin: '14px 0 20px', padding: '14px 16px', background: 'rgba(183,141,82,0.08)', borderRadius: '10px', border: '1px solid rgba(183,141,82,0.22)' }}>
              <div style={{ color: '#8c5825', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>✦ Hamper Includes (Strictly Nuts Only):</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {hamper.pouches.map((p) => (
                  <span key={p.name} style={{ background: '#fff', border: '1px solid #d9bd91', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', color: '#38243F', fontWeight: 500 }}>
                    {p.name} ({p.weight})
                  </span>
                ))}
                <span style={{ background: '#38243F', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                  + ₹50 Rigid Gift Box Packaging
                </span>
              </div>
            </div>
          )}

          <p className="product-detail__long">
            A considered pantry staple from the NAAVORI collection, gathered for texture, provenance and a clean, expressive finish. Naturally grown, quality checked and packed close to source.
          </p>

          <div className="product-purchase">
            <div className="purchase-row">
              <div>
                <span className="purchase-label">{hamper ? 'Presentation Format' : 'Choose your weight'}</span>
                {hamper ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="is-active" style={{ cursor: 'default', padding: '8px 16px', borderRadius: '20px', border: '1px solid #38243F', background: '#38243F', color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>
                      🎁 Luxury Rigid Hamper Box ({hamper.pouches.length} Pouches Set)
                    </button>
                  </div>
                ) : isSaffron ? (
                  <div className="weight-options">
                    {saffronOptions.map((item, index) => (
                      <button
                        key={item.label}
                        className={weight === item.label ? 'is-active' : ''}
                        onClick={() => { setWeight(item.label); setGallery(index); }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="weight-options">
                    {weights.map((item, index) => (
                      <button
                        key={item.label}
                        className={weight === item.label ? 'is-active' : ''}
                        onClick={() => { setWeight(item.label); setGallery(index); }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="purchase-stock"><span className="stock-dot" /> In stock</div>
            </div>

            <div className="purchase-row purchase-row--price">
              <strong>{money(total)}</strong>
              <span>Inclusive of all taxes</span>
            </div>

            <div className="purchase-actions">
              <div className="quantity-control">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={13} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity"><Plus size={13} /></button>
              </div>
              <button className="button button--dark" onClick={() => addToCart(product, weight, quantity)}>
                Add to cart <ShoppingBag size={16} />
              </button>
              <button className="button button--gold" onClick={() => { addToCart(product, weight, quantity); navigate('/checkout'); }}>
                Buy now <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="purchase-perks">
              <span><PackageCheck size={15} /> Freshly packed</span>
              <span><ShieldAlert size={15} color="#b78d52" /> Non-returnable food item</span>
              <span><ShieldCheck size={15} /> Secure checkout</span>
              <span><TruckIcon /> Free shipping over ₹999</span>
            </div>

            <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(183, 141, 82, 0.08)', border: '1px solid rgba(183, 141, 82, 0.22)', fontSize: '11.5px', color: 'var(--brown-soft)', lineHeight: '1.45' }}>
              <strong style={{ color: '#8c5825', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px', fontWeight: 600 }}>
                <ShieldAlert size={13} /> Food Safety & Hygiene Notice:
              </strong>
              <span>As this is a perishable gourmet edible product, it is <strong>strictly non-returnable and non-refundable</strong> once dispatched.</span>
            </div>
            <PinCodeChecker />
          </div>

          <div className="product-facts">
            <div><p className="eyebrow">Origin</p><strong>{product.origin}, India</strong></div>
            <div><p className="eyebrow">Storage</p><strong>Cool, dry place</strong></div>
            <div><p className="eyebrow">Ingredients</p><strong>100% natural {product.name.toLowerCase()}</strong></div>
          </div>
        </section>
      </div>

      <section className="product-detail__standards">
        <div>
          <p className="eyebrow">The NAAVORI standard</p>
          <h2>Goodness, <em>with provenance.</em></h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <div key={benefit}>
              <Leaf size={17} />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function TruckIcon() { return <span className="truck-icon" aria-hidden="true">↗</span>; }

function BuilderVisualizer({ kind, selected, options }: { kind: BuilderKind; selected: string[]; options: BuilderOption[] }) {
  const selectedOptions = selected.flatMap((id) => { const option = options.find((item) => item.id === id); return option ? [option] : []; });
  const folder = kind === 'spice-blend' ? 'products-spices' : kind === 'seed-mix' ? 'products-seeds' : 'products-official';
  return (
    <div className={`builder-box builder-box--${kind}`}>
      <div className="builder-box__halo" />
      <div className="builder-box__lid">
        <span>NAAVORI</span>
        <small>THE CUSTOM EDIT</small>
      </div>
      <div className="builder-box__contents">
        {selectedOptions.length === 0 ? (
          <div className="builder-box__empty">
            Choose ingredients<br />
            <small>your box will fill here</small>
          </div>
        ) : (
          selectedOptions.map((option, index) => {
            const product = findProduct(option.productId) || findProduct(option.id);
            const fallbackSrc = asset(`${folder}/${option.productId}-100g.webp`);
            const fallbackPouchSrc = asset(`${folder}/${option.productId}-250g.webp`);
            const imgSrc = product ? productImage(product, '100g') : fallbackSrc;
            return (
              <img
                key={`${option.id}-${index}`}
                className="builder-ingredient"
                style={{ '--i': index, '--count': selectedOptions.length } as CSSProperties}
                src={imgSrc}
                alt={`${option.label} ingredient`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackPouchSrc;
                }}
              />
            );
          })
        )}
      </div>
      <div className="builder-box__label">
        <strong>{selected.length * 25 || 0}g</strong>
        <span>hand finished</span>
      </div>
    </div>
  );
}

function BuilderExperience({ kind, addCustomToCart }: { kind: BuilderKind; addCustomToCart: (kind: BuilderKind, ids: string[], grams: number, price: number) => void }) {
  const data = builderData[kind];
  const [selected, setSelected] = useState<string[]>(data.options.slice(0, kind === 'spice-blend' ? 2 : 3).map((option) => option.id));
  const [grams, setGrams] = useState(250);
  const price = Math.max(0, Math.round(selected.reduce((sum, id) => { const option = data.options.find((item) => item.id === id); const product = option ? findProduct(option.productId) : undefined; return sum + (product ? numericPrice(product.price) : 0); }, 0) * (grams / 250) / Math.max(1, selected.length) * 1.2));
  return <div className="builder-experience"><div className="builder-experience__preview"><BuilderVisualizer kind={kind} selected={selected} options={data.options} /><div className="builder-experience__proof"><span><Check size={13} /> Single origin</span><span><Check size={13} /> No preservatives</span><span><Check size={13} /> Gift ready</span></div></div><div className="builder-experience__controls"><p className="eyebrow">Choose your ingredients</p><div className="builder-option-grid">{data.options.map((option) => <button key={option.id} className={selected.includes(option.id) ? 'is-selected' : ''} onClick={() => setSelected((current) => current.includes(option.id) ? current.filter((item) => item !== option.id) : [...current, option.id])}><span className="builder-option__check">{selected.includes(option.id) ? <Check size={13} /> : <Plus size={13} />}</span><span><strong>{option.label}</strong><small>{option.note}</small></span></button>)}</div><div className="builder-size-row"><span>Box size</span><div>{[150, 250, 450].map((value) => <button key={value} className={grams === value ? 'is-active' : ''} onClick={() => setGrams(value)}>{value}g</button>)}</div></div><div className="builder-total"><span>Estimated edit</span><strong>{money(price)}</strong></div><button className="button button--dark button--full" disabled={!selected.length} onClick={() => addCustomToCart(kind, selected, grams, price)}>Add this custom edit <ShoppingBag size={15} /></button><p className="builder-note">Your final blend is weighed, sealed and finished by hand.</p></div></div>;
}

function BuilderShowcase({ navigate, addCustomToCart }: { navigate: (path: string) => void; addCustomToCart: (kind: BuilderKind, ids: string[], grams: number, price: number) => void }) {
  return <section className="builders section-pad" id="builders"><div className="section-heading section-heading--split" data-reveal><div><p className="eyebrow">04 · The custom edit</p><h2>Build a ritual<br /><em>of your own.</em></h2></div><p className="section-intro">Three premium ways to compose something personal — with real NAAVORI ingredients, a gift-ready finish and a little more intention.</p></div><div className="builder-tiles">{(Object.keys(builderData) as BuilderKind[]).map((kind, index) => { const data = builderData[kind]; return <button key={kind} className={`builder-tile builder-tile--${kind}`} onClick={() => navigate(`/build/${kind}`)} data-reveal><span className="builder-tile__number">0{index + 1}</span><img src={asset(data.image)} alt={`${data.label} NAAVORI packaging`} loading="lazy" /><span className="builder-tile__copy"><p className="eyebrow">{data.kicker}</p><h3>{data.title}</h3><em>{data.copy}</em><strong>Start composing <ArrowUpRight size={14} /></strong></span></button>; })}</div><div className="builder-inline"><BuilderExperience kind="nut-mix" addCustomToCart={addCustomToCart} /></div></section>;
}

function GiftBoxCard({ hamper, onAddToCart, onBuyNow, navigate }: { hamper: GiftHamper; onAddToCart: (hamper: GiftHamper) => void; onBuyNow: (hamper: GiftHamper) => void; navigate: (path: string) => void }) {
  return (
    <article className="gift-box-card is-visible" style={{ opacity: 1, transform: 'none' }}>
      <div className="gift-box-card__stage">
        <span className="gift-box-card__tag">{hamper.tag}</span>
        <div className="gift-box-card__halo" />

        {/* Aesthetic Rigid Hamper Box in website's Royal Plum & Antique Gold */}
        <div className="gift-hamper-tray" aria-hidden="true">
          <div className="gift-hamper-tray__lid-back" />
          <div className="gift-hamper-tray__silk-bed" />
          <div className="gift-hamper-tray__front">
            <div className="gift-hamper-tray__ribbon" />
            <div className="gift-hamper-tray__seal">
              <span className="gift-hamper-tray__seal-star">✦</span>
              <strong>NAAVORI</strong>
              <small>HERITAGE BOX</small>
            </div>
            <span className="gift-hamper-tray__gold-trim" />
          </div>
        </div>

        <div className="gift-box-card__pouches">
          {hamper.pouches.map((pouch) => (
            <img
              key={pouch.name}
              src={asset(pouch.image)}
              alt={`${pouch.name} packet`}
              className={`gift-box-card__pouch gift-box-card__pouch--${pouch.position}`}
              loading="lazy"
            />
          ))}
        </div>
      </div>
      <div className="gift-box-card__content">
        <p className="gift-box-card__kicker">{hamper.kicker}</p>
        <h3 className="gift-box-card__title">{hamper.name}</h3>
        <div className="gift-box-card__items">
          {hamper.pouches.map((pouch) => (
            <span key={pouch.name} className="gift-pouch-badge">
              ✦ {pouch.name} ({pouch.weight})
            </span>
          ))}
        </div>
        <p className="gift-box-card__desc">{hamper.description}</p>
        <div className="gift-box-card__footer">
          <div className="gift-box-card__price-box">
            <strong style={{ fontSize: '20px' }}>{money(hamper.price)}</strong>
            <small style={{ color: '#8c5825', fontWeight: 600, display: 'block', marginTop: '2px' }}>
              🎁 Includes ₹50 Luxury Gift Box
            </small>
            {hamper.ingredientsPrice && (
              <span style={{ fontSize: '11px', color: '#777', display: 'block', marginTop: '1px' }}>
                (Nuts: ₹{hamper.ingredientsPrice} + Box: ₹50)
              </span>
            )}
          </div>
          <div className="gift-box-card__cta-group">
            <button className="text-button" onClick={() => onAddToCart(hamper)}>
              Add to bag <ArrowUpRight size={13} />
            </button>
            <button className="text-button text-button--secondary" onClick={() => onBuyNow(hamper)}>
              Buy now <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function GiftingSection({ navigate, onAddToCart, onBuyNow }: { navigate: (path: string) => void; onAddToCart: (hamper: GiftHamper) => void; onBuyNow: (hamper: GiftHamper) => void }) {
  const [activeOccasion, setActiveOccasion] = useState<string>('all');
  const filteredHampers = useMemo(() => {
    if (activeOccasion === 'all') return giftHampers;
    return giftHampers.filter((h) => {
      if (Array.isArray(h.occasion)) return h.occasion.includes(activeOccasion);
      return h.occasion === activeOccasion;
    });
  }, [activeOccasion]);

  return (
    <section className="gifting-section section-pad" id="gifting">
      <div className="section-heading section-heading--split" data-reveal>
        <div>
          <p className="eyebrow">03 · Considered Gifting & Hampers</p>
          <h2>Goodness, wrapped<br /><em>with intention.</em></h2>
        </div>
        <p className="section-intro">
          Curated gift collections featuring our signature luxury stand-up pouches. Pure provenance, authentic taste, and artisanal gift box presentation.
        </p>
      </div>

      {/* Occasion Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }} data-reveal>
        {[
          { id: 'all', label: 'All Hampers' },
          { id: 'festive', label: '✨ Affordable Hampers (Under ₹1200)' },
          { id: 'corporate', label: '🏢 Corporate Gifting' },
          { id: 'wedding', label: '💍 Wedding Gifting' },
          { id: 'birthday', label: '🎂 Birthday Gifting' },
          { id: 'wellness', label: '🌿 Wellness Editions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveOccasion(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '24px',
              border: activeOccasion === tab.id ? '1px solid #38243F' : '1px solid #EAEAEA',
              backgroundColor: activeOccasion === tab.id ? '#38243F' : '#fff',
              color: activeOccasion === tab.id ? '#fff' : '#555',
              fontFamily: 'DM Sans',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="gifting-grid">
        {filteredHampers.map((hamper) => (
          <GiftBoxCard
            key={hamper.id}
            hamper={hamper}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
            navigate={navigate}
          />
        ))}
      </div>

      <div className="gifting-bulk-banner" data-reveal>
        <div>
          <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Bespoke, Wedding & Corporate Orders</span>
          <h3>Looking for bespoke wedding<br /><em>or corporate gifting?</em></h3>
          <p>
            We curate bespoke packaging with personalized gold foil seals, custom calligraphy greeting notes, and curated mixes tailored to your occasion.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button className="button button--gold" onClick={() => navigate('/contact')}>
            Enquire bulk gifting <ArrowUpRight size={15} />
          </button>
          <button className="button button--quiet" onClick={() => navigate('/build/nut-mix')}>
            Build custom edit <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

function GiftingPage({ navigate, onAddToCart, onBuyNow, setToast }: { navigate: (path: string) => void; onAddToCart: (hamper: GiftHamper) => void; onBuyNow: (hamper: GiftHamper) => void; setToast: (msg: string) => void }) {
  const [activeOccasion, setActiveOccasion] = useState<string>('all');
  const filteredHampers = useMemo(() => {
    if (activeOccasion === 'all') return giftHampers;
    return giftHampers.filter((h) => {
      if (Array.isArray(h.occasion)) return h.occasion.includes(activeOccasion);
      return h.occasion === activeOccasion;
    });
  }, [activeOccasion]);

  return (
    <>
      <section className="page-hero page-hero--shop" style={{ backgroundImage: `linear-gradient(rgba(56,36,63,0.7), rgba(56,36,63,0.7)), url(${asset('compositions/brand-reference.webp')})`, backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff' }}>
        <p className="eyebrow" style={{ color: 'var(--gold-light)' }}>The Gifting Archive · Considered Elegance</p>
        <h1 style={{ color: '#fff' }}>A quieter kind<br /><em>of gifting.</em></h1>
        <p style={{ color: 'rgba(255,255,255,0.85)' }}>
          No loud artificial boxes. Every NAAVORI hamper brings together 100% premium gourmet nuts in our signature stand-up pouches, packed inside a handcrafted luxury rigid presentation box.
        </p>
      </section>

      <main className="section-pad">
        <div className="section-heading section-heading--split" style={{ marginBottom: '30px' }}>
          <div>
            <p className="eyebrow">Signature Curations</p>
            <h2>Selected for<br /><em>special moments.</em></h2>
          </div>
          <button className="line-button" onClick={() => navigate('/shop')}>
            <ArrowLeft size={14} /> Back to all ingredients
          </button>
        </div>

        {/* Occasion Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {[
            { id: 'all', label: 'All Hampers' },
            { id: 'festive', label: '✨ Affordable Hampers (Under ₹1200)' },
            { id: 'corporate', label: '🏢 Corporate Gifting' },
            { id: 'wedding', label: '💍 Wedding Gifting' },
            { id: 'birthday', label: '🎂 Birthday Gifting' },
            { id: 'wellness', label: '🌿 Wellness Editions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveOccasion(tab.id)}
              style={{
                padding: '9px 20px',
                borderRadius: '24px',
                border: activeOccasion === tab.id ? '1px solid #38243F' : '1px solid #EAEAEA',
                backgroundColor: activeOccasion === tab.id ? '#38243F' : '#fff',
                color: activeOccasion === tab.id ? '#fff' : '#555',
                fontFamily: 'DM Sans',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="gifting-grid">
          {filteredHampers.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>
              <p style={{ color: '#888', fontSize: '15px' }}>No hampers currently in this category.</p>
              <button className="button button--dark" style={{ marginTop: '12px' }} onClick={() => setActiveOccasion('all')}>
                Browse All Hampers
              </button>
            </div>
          ) : (
            filteredHampers.map((hamper) => (
              <GiftBoxCard
                key={hamper.id}
                hamper={hamper}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                navigate={navigate}
              />
            ))
          )}
        </div>

        <div className="gifting-bulk-banner" style={{ marginTop: '70px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Concierge Service</span>
            <h3>Bespoke Corporate & Wedding Curation</h3>
            <p>
              Direct sourcing, custom branding, and door-to-door pan-India delivery for 25 to 5,000+ units.
            </p>
          </div>
          <button className="button button--gold" onClick={() => navigate('/contact')}>
            Connect with Concierge <ArrowUpRight size={15} />
          </button>
        </div>
      </main>
    </>
  );
}

function OriginMap({ activeOrigin, setActiveOrigin, setQuickView, navigate }: { activeOrigin: OriginKey; setActiveOrigin: (origin: OriginKey) => void; setQuickView: (product: Product) => void; navigate: (path: string) => void }) {
  const currentOrigin = origins[activeOrigin];
  const originProducts = currentOrigin.products.map((name) => globalCatalogue.find((product) => product.name === name)).filter((product): product is Product => Boolean(product));
  return <section className="origin section-pad" id="origin"><div className="origin__top" data-reveal><div><p className="eyebrow">05 · Shop by origin</p><h2>Every flavour has<br /><em>a place.</em></h2></div><p className="section-intro">An interactive atlas of the landscapes behind each ingredient — and the people who make them worth knowing.</p></div><div className="origin__experience origin__experience--immersive" data-reveal><div className={`origin__map origin__map--${activeOrigin.toLowerCase().replaceAll(' ', '-')}`}><div className="origin__map-stage"><div className="origin__map-glow" /><svg className="india-map-shape" viewBox="0 0 300 420" aria-hidden="true"><path d="M100 16 139 29 163 52 184 61 179 87 204 108 188 136 211 161 200 188 222 208 211 233 229 259 212 280 195 312 172 340 152 389 126 354 112 322 92 300 78 274 65 243 43 220 51 194 32 172 57 149 44 126 65 103 58 77 76 59 72 37Z" /></svg><div className="map-ring map-ring--one" /><div className="map-ring map-ring--two" /><div className="map-ring map-ring--three" />{(Object.keys(origins) as OriginKey[]).map((origin) => <button key={origin} className={`map-pin map-pin--${origin.toLowerCase().replaceAll(' ', '-')} ${activeOrigin === origin ? 'is-active' : ''}`} onClick={() => setActiveOrigin(origin)} aria-pressed={activeOrigin === origin} aria-label={`Explore ${origin}`}><span className="map-pin__dot" /><strong>{origin}</strong><small className="map-pin__tooltip">Explore {origin}</small></button>)}<aside className="origin__popup" aria-live="polite"><img src={asset(currentOrigin.image)} alt={`${activeOrigin} origin composition`} loading="lazy" /><div><p className="eyebrow">{activeOrigin} · {currentOrigin.region}</p><h3>{currentOrigin.title}</h3><p>{currentOrigin.copy}</p><div className="origin__ingredients">{currentOrigin.ingredients.map((ingredient) => <span key={ingredient}>{ingredient}</span>)}</div><div className="origin__popup-products">{originProducts.map((product) => <button key={product.id} onClick={() => setQuickView(product)}>{product.name}<ArrowUpRight size={13} /></button>)}</div><button className="origin__popup-cta" onClick={() => navigate(`/shop?origin=${encodeURIComponent(activeOrigin)}`)}>Explore this origin <ArrowUpRight size={13} /></button></div></aside><span className="map-caption">INDIA · ORIGINS OF THE EXOTIC</span></div></div></div><div className="origin__recommendations"><p className="eyebrow">A taste of {activeOrigin}</p><div className="origin__mini-grid">{originProducts.slice(0, 3).map((product) => <button key={product.id} className="mini-product" onClick={() => setQuickView(product)}><span style={{ backgroundImage: `url(${productImage(product)})`, backgroundPosition: product.imagePosition }} /><strong>{product.name}</strong><small>{product.price}</small></button>)}</div></div></section>;
}

function RouteChrome({ route, navigate, cartCount, wishlistCount, customer }: { route: string; navigate: (path: string) => void; cartCount: number; wishlistCount: number; customer: CustomerUser | null }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="route-header">
      <button className="header-brand" onClick={() => navigate('/')}><LogoImage /></button>
      <nav className={open ? 'route-nav route-nav--open' : 'route-nav'}>
        <button className={route === '/' ? 'is-active' : ''} onClick={() => navigate('/')}>Home</button>
        <button className={route === '/shop' ? 'is-active' : ''} onClick={() => navigate('/shop')}>Shop</button>
        <button className={route.startsWith('/build/') ? 'is-active' : ''} onClick={() => navigate('/build/nut-mix')}>Build</button>
        <button className={route === '/gifting' ? 'is-active' : ''} onClick={() => navigate('/gifting')}>Gifting</button>
        <button onClick={() => navigate('/nuts')}>Collections</button>
        <button
          className={route === '/reviews' ? 'is-active' : ''}
          onClick={() => {
            if (route === '/') {
              document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              navigate('/');
              setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }), 300);
            }
          }}
        >
          Reviews
        </button>
        <button className={route === '/about' ? 'is-active' : ''} onClick={() => navigate('/about')}>About</button>
        <button className={route === '/contact' ? 'is-active' : ''} onClick={() => navigate('/contact')}>Contact</button>
      </nav>
      <div className="route-actions">
        <button 
          className="icon-button" 
          onClick={() => navigate(customer ? '/account' : '/login')} 
          aria-label={customer ? 'Account' : 'Sign in'} 
          title={customer ? `Signed in as ${customer.name}` : 'Sign in / Register'}
          style={{ position: 'relative' }}
        >
          <User size={18} />
          {customer && (
            <span style={{ 
              width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#52c41a', 
              position: 'absolute', top: '5px', right: '5px', border: '1px solid #fff' 
            }} />
          )}
        </button>
        <button className="icon-button route-wishlist" onClick={() => navigate('/wishlist')} aria-label="Wishlist"><Heart size={18} /><span>{wishlistCount}</span></button>
        <button className="icon-button cart-button" onClick={() => navigate('/cart')} aria-label="Shopping bag"><ShoppingBag size={18} /><span>{cartCount}</span></button>
        <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
  );
}

function ShopBuilderCards({ navigate }: { navigate: (path: string) => void }) {
  return <section className="shop-builders"><div className="shop-builders__heading"><p className="eyebrow">Make it yours</p><h2>Compose something<br /><em>personal.</em></h2></div><div className="shop-builders__grid">{(Object.keys(builderData) as BuilderKind[]).map((kind) => <button key={kind} className={`shop-builder-card shop-builder-card--${kind}`} onClick={() => navigate(`/build/${kind}`)}><img src={asset(builderData[kind].image)} alt={`${builderData[kind].label} builder`} loading="lazy" /><span><p className="eyebrow">{builderData[kind].label}</p><h3>{builderData[kind].title}</h3><strong>Open builder <ArrowUpRight size={14} /></strong></span></button>)}</div></section>;
}

function ProductGrid({ items, wishlist, toggleWishlist, addToCart, buyNow, navigate }: { items: Product[]; wishlist: string[]; toggleWishlist: (id: string) => void; addToCart: (product: Product) => void; buyNow: (product: Product) => void; navigate: (path: string) => void }) {
  return <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product} liked={wishlist.includes(product.id)} onLike={() => toggleWishlist(product.id)} onCart={() => addToCart(product)} onBuy={() => buyNow(product)} onQuickView={() => navigate(`/product/${product.id}`)} />)}</div>;
}

function ShopPage({ wishlist, toggleWishlist, addToCart, buyNow, navigate, catalogue }: { wishlist: string[]; toggleWishlist: (id: string) => void; addToCart: (product: Product) => void; buyNow: (product: Product) => void; navigate: (path: string) => void; catalogue: Product[] }) {
  const [category, setCategory] = useState<'All' | Category>('All');
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get('query') ?? '');
  const [sort, setSort] = useState('featured');
  const originFilter = new URLSearchParams(window.location.search).get('origin') ?? '';

  const items = useMemo(() => {
    const filtered = catalogue.filter((product) => (!originFilter || product.origin === originFilter) && (category === 'All' || product.category === category) && `${product.name} ${product.origin}`.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => sort === 'price-low' ? numericPrice(a.price) - numericPrice(b.price) : sort === 'price-high' ? numericPrice(b.price) - numericPrice(a.price) : 0);
  }, [category, query, sort, originFilter, catalogue]);

  return <><section className="page-hero page-hero--shop"><p className="eyebrow">The collection · {catalogue.length} authentic products</p><h1>Shop the<br /><em>pantry.</em></h1><p>From valley-grown nuts to spice-coast aromatics, every package carries a sense of place.</p></section><main className="shop-page"><ShopBuilderCards navigate={navigate} /><div className="shop-toolbar"><div className="shop-categories"><button className={category === 'All' ? 'is-active' : ''} onClick={() => setCategory('All')}>All</button>{(['Nuts', 'Seeds', 'Spices'] as const).map((item) => <button key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="shop-tools"><label className="shop-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ingredients" /></label><label className="shop-sort"><SlidersHorizontal size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div></div><div className="shop-summary"><p>{items.length} ingredients{originFilter ? ` · ${originFilter}` : ''}</p><button onClick={() => navigate('/nuts')}>Browse category pages <ArrowUpRight size={14} /></button></div><ProductGrid items={items} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} buyNow={buyNow} navigate={navigate} />{items.length === 0 && <div className="empty-shop"><Search size={21} /><h3>Nothing found in this edit.</h3><p>Try another ingredient, origin or category.</p></div>}</main></>;
}

function CategoryPage({ kind, wishlist, toggleWishlist, addToCart, buyNow, navigate, catalogue }: { kind: Category; wishlist: string[]; toggleWishlist: (id: string) => void; addToCart: (product: Product) => void; buyNow: (product: Product) => void; navigate: (path: string) => void; catalogue: Product[] }) {
  const meta = { Nuts: { kicker: '01 · The nut archive', title: 'Nuts with a\nquiet richness.', copy: 'Whole, buttery, sun-warmed and selected for the kind of crunch that makes a pause feel complete.', origin: 'From cool valleys to coastal orchards, our nuts carry the character of their landscape.', benefit: 'A daily source of considered energy, natural goodness and deeply satisfying texture.' }, Seeds: { kicker: '02 · The seed archive', title: 'Small ingredients.\nQuiet power.', copy: 'A considered collection of mineral-rich seeds, gathered for their texture, versatility and everyday nourishment.', origin: 'From Gujarat’s warm fields to Uttarakhand’s clear mountain air, these tiny ingredients travel well.', benefit: 'Sprinkle, bake, blend or simply keep them close for a thoughtful pantry ritual.' }, Spices: { kicker: '03 · The spice archive', title: 'Warmth,\nwith a sense of place.', copy: 'Aromatic botanicals and whole spices, sourced from India’s most expressive growing regions.', origin: 'Our spice trail moves from Malabar pepper gardens to saffron fields in the north.', benefit: 'A little warmth transforms the everyday — and connects a dish to where it came from.' } }[kind];
  const items = catalogue.filter((product) => product.category === kind);
  return <><section className="category-hero page-hero" style={{ '--category-image': `url(${asset(`compositions/category-${kind.toLowerCase()}.webp`)})`, '--category-position': 'center' } as CSSProperties}><p className="eyebrow">{meta.kicker}</p><h1>{meta.title.split('\n').map((line) => <span key={line}><em>{line}</em><br /></span>)}</h1><p>{meta.copy}</p></section><main className="category-page"><div className="category-page__intro"><div><p className="eyebrow">The {kind.toLowerCase()} edit</p><h2>Selected for<br /><em>the everyday.</em></h2></div><div><p>{meta.benefit}</p><span className="category-page__origin"><MapPin size={15} /> {meta.origin}</span></div></div><ProductGrid items={items} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} buyNow={buyNow} navigate={navigate} /><div className="category-page__back"><button className="line-button" onClick={() => navigate('/shop')}><ArrowLeft size={15} /> Back to all ingredients</button></div></main></>;
}

function BuilderPage({ kind, addCustomToCart, navigate }: { kind: BuilderKind; addCustomToCart: (kind: BuilderKind, ids: string[], grams: number, price: number) => void; navigate: (path: string) => void }) {
  const data = builderData[kind];
  return <><section className="builder-page-hero page-hero"><p className="eyebrow">{data.kicker}</p><h1>{data.title.split(' ').slice(0, -1).join(' ')}<br /><em>{data.title.split(' ').at(-1)}</em></h1><p>{data.copy} Every selection is local, real and ready to become part of your ritual.</p></section><main className="builder-page"><button className="product-detail__back" onClick={() => navigate('/shop')}><ArrowLeft size={15} /> Back to the collection</button><BuilderExperience kind={kind} addCustomToCart={addCustomToCart} /><div className="builder-page__story"><p className="eyebrow">The NAAVORI promise</p><h2>Small batch.<br /><em>Beautifully finished.</em></h2><p>We keep the source visible, the ingredient honest and the final presentation worthy of the person receiving it.</p></div></main></>;
}

function ContactPage({ setToast }: { setToast: (msg: string) => void }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const message = form.get('message') as string;

    try {
      await api.post('/support/tickets', {
        subject: `Storefront Concierge: ${name}`,
        message,
        name,
        email
      });
      setSent(true);
      setToast('Your note has been received by our concierge.');
    } catch {
      setSent(true);
      setToast('Thank you for writing. Our concierge will connect shortly.');
    } finally {
      setSubmitting(false);
    }
  };

  return <><section className="contact-hero page-hero"><div className="contact-hero__copy"><p className="eyebrow">A considered conversation</p><h1>Come say<br /><em>hello.</em></h1><p>For sourcing questions, gifting conversations or simply a note from the pantry, our door is open.</p></div><div className="contact-hero__visual"><img src={asset('products-official/dry-coconut-250g.webp')} alt="NAAVORI Premium Dry Coconut packaging" loading="eager" /><span>Freshly packed · Varanasi</span></div></section><section className="contact-strip section-pad"><div><p className="eyebrow">Visit the house</p><strong>K63/112, Nakkash<br />Bhoot Bhairav, Varanasi – 221001</strong></div><div><p className="eyebrow">Call the owner & concierge</p><div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}><a href="tel:+918318829334">+91 83188 29334 (Owner)</a><a href="tel:+918448170969">+91 84481 70969 (Direct)</a></div></div><div><p className="eyebrow">Write with care</p><a href="mailto:info@naavori.in">info@naavori.in</a></div></section><section className="simple-detail section-pad" style={{ maxWidth: 840, margin: '0 auto' }}><div className="simple-detail__mark"><Mail size={24} /></div><p className="eyebrow">Send a note to the house</p><h2>Let’s make something<br /><em>beautiful.</em></h2>{sent ? <div style={{ padding: '24px', background: 'rgba(56, 36, 63, 0.05)', borderRadius: '12px', marginTop: '20px' }}><h3>Thank you for writing to NAAVORI.</h3><p>Your message has been registered with our concierge team. We reply within one business day.</p></div> : <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '28px', textAlign: 'left' }}><label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>Your name<input required name="name" placeholder="Full name" style={{ padding: '12px 14px', border: '1px solid var(--line, rgba(0,0,0,0.1))', borderRadius: '8px', background: '#fff', color: '#38243F', fontFamily: 'DM Sans', fontSize: '14px' }} /></label><label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>Your email<input required name="email" type="email" placeholder="you@domain.com" style={{ padding: '12px 14px', border: '1px solid var(--line, rgba(0,0,0,0.1))', borderRadius: '8px', background: '#fff', color: '#38243F', fontFamily: 'DM Sans', fontSize: '14px' }} /></label><label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>Message or inquiry<textarea required name="message" rows={4} placeholder="Tell us how we can help..." style={{ padding: '12px 14px', border: '1px solid var(--line, rgba(0,0,0,0.1))', borderRadius: '8px', background: '#fff', color: '#38243F', fontFamily: 'DM Sans', fontSize: '14px', resize: 'vertical' }} /></label><button disabled={submitting} type="submit" className="button button--dark" style={{ gridColumn: '1 / -1', justifySelf: 'start', marginTop: '8px' }}>{submitting ? 'Sending note...' : 'Send message to Concierge'} <ArrowUpRight size={15} /></button></form>}</section></>;
}

function SimplePage({ type, navigate }: { type: 'about' | 'our-story'; navigate: (path: string) => void }) {
  const content = type === 'our-story' ? { eyebrow: 'The NAAVORI story', title: 'Rooted in India.\nMade for tomorrow.', copy: 'NAAVORI brings together the richness of Indian landscapes and a modern ritual of care — one ingredient, one relationship and one beautiful detail at a time.' } : { eyebrow: 'About the house', title: 'A quieter kind\nof indulgence.', copy: 'We make pantry staples feel worth pausing for. Not louder, not busier — simply more considered.' };
  return <><section className="simple-page page-hero"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title.split('\n').map((line) => <span key={line}><em>{line}</em><br /></span>)}</h1><p>{content.copy}</p><button className="button button--dark" onClick={() => navigate('/shop')}>Explore the collection <ArrowUpRight size={16} /></button></section><section className="simple-detail section-pad"><div className="simple-detail__mark"><Home size={24} /></div><p className="eyebrow">Pure origins · real goodness</p><h2>The details are<br /><em>the difference.</em></h2><p>Single origin, hand selected, 100% natural, no chemicals, no preservatives, small batch and carefully curated — this is why NAAVORI belongs in a different part of the pantry.</p></section></>;
}

function OrderTotals({ cart, discount = 0 }: { cart: CartLine[]; discount?: number }) {
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = Math.max(0, subtotal + shipping + tax - discount);
  return { subtotal, shipping, tax, total: grandTotal, rawTotal: subtotal + shipping + tax };
}

function CartPage({ cart, updateQuantity, removeLine, navigate }: { cart: CartLine[]; updateQuantity: (id: string, delta: number) => void; removeLine: (id: string) => void; navigate: (path: string) => void }) {
  const totals = OrderTotals({ cart });
  return <><section className="page-hero cart-hero"><p className="eyebrow">Your considered edit</p><h1>The shopping<br /><em>bag.</em></h1><p>Review your ingredients, adjust the quantities and take your edit through to a future-ready secure checkout.</p></section><main className="cart-page section-pad">{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={25} /><h2>Your bag is waiting.</h2><p>Begin with a beautiful ingredient from the collection.</p><button className="button button--dark" onClick={() => navigate('/shop')}>Shop the collection <ArrowUpRight size={15} /></button></div> : <div className="cart-layout"><section className="cart-lines"><div className="cart-lines__header"><p className="eyebrow">{cart.reduce((sum, line) => sum + line.quantity, 0)} items selected</p><button onClick={() => navigate('/shop')}>Continue shopping <ArrowUpRight size={14} /></button></div>{cart.map((line) => <article className="cart-line" key={line.id}><img src={line.image} alt={`${line.name} packaging`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultFallbackPouch(line.category); }} /><div className="cart-line__info"><p className="eyebrow">{line.category} · {line.origin}</p><h3>{line.name}</h3><span>{line.weight}{line.custom ? ' · Custom edit' : ' · Premium quality'}</span></div><div className="cart-line__quantity"><button onClick={() => updateQuantity(line.id, -1)} aria-label={`Decrease ${line.name}`}><Minus size={13} /></button><strong>{line.quantity}</strong><button onClick={() => updateQuantity(line.id, 1)} aria-label={`Increase ${line.name}`}><Plus size={13} /></button></div><strong className="cart-line__price">{money(line.price * line.quantity)}</strong><button className="cart-line__remove" onClick={() => removeLine(line.id)} aria-label={`Remove ${line.name}`}><Trash2 size={15} /></button></article>)}</section><aside className="cart-summary"><p className="eyebrow">Order summary</p><h2>Ready when<br /><em>you are.</em></h2><div className="cart-summary__rows"><span>Subtotal <strong>{money(totals.subtotal)}</strong></span><span>Shipping <strong>{totals.shipping ? money(totals.shipping) : 'Complimentary'}</strong></span><span>Tax <strong>{money(totals.tax)}</strong></span><span className="cart-summary__total">Grand total <strong>{money(totals.total)}</strong></span></div><div style={{ margin: '14px 0', padding: '12px 14px', borderRadius: '10px', background: 'rgba(244, 237, 228, 0.08)', border: '1px solid rgba(212, 175, 55, 0.35)', fontSize: '11.5px', color: 'rgba(244, 237, 228, 0.88)', lineHeight: '1.45' }}><strong style={{ color: 'var(--gold-light, #d9bd91)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', fontWeight: 600 }}><ShieldAlert size={13} /> Strict No-Return Policy:</strong><span>Perishable gourmet food product. Items are <strong style={{ color: '#fff' }}>strictly non-returnable and non-refundable</strong> once dispatched to maintain food safety and hygiene.</span></div><p className="cart-summary__note">Free shipping on orders above ₹999. Fresh batch dispatched directly from Varanasi.</p><button className="button button--gold button--full" onClick={() => navigate('/checkout')}>Continue to billing <ArrowUpRight size={15} /></button></aside></div>}</main></>;
}

function WishlistPage({ wishlist, toggleWishlist, addToCart, buyNow, navigate }: { wishlist: string[]; toggleWishlist: (id: string) => void; addToCart: (product: Product) => void; buyNow: (product: Product) => void; navigate: (path: string) => void }) {
  const items = wishlist.map(findProduct).filter((product): product is Product => Boolean(product));
  return <><section className="page-hero wishlist-hero"><p className="eyebrow">Saved with intention</p><h1>Your quiet<br /><em>edit.</em></h1><p>A considered place for the ingredients you want to come back to.</p></section><main className="wishlist-page section-pad">{items.length ? <ProductGrid items={items} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} buyNow={buyNow} navigate={navigate} /> : <div className="empty-cart"><Heart size={25} /><h2>Nothing saved yet.</h2><p>Tap the heart on an ingredient to keep it close.</p><button className="button button--dark" onClick={() => navigate('/shop')}>Discover the collection <ArrowUpRight size={15} /></button></div>}</main></>;
}

function BillingPage({
  cart,
  navigate,
  setToast,
  clearCart,
  customer,
  onCustomerAuth,
  onLogout,
}: {
  cart: CartLine[];
  navigate: (path: string) => void;
  setToast: (message: string) => void;
  clearCart: () => void;
  customer: CustomerUser | null;
  onCustomerAuth: (user: CustomerUser) => void;
  onLogout: () => void;
}) {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const paymentMethod = 'cod';

  // Address and contact fields
  const defaultAddr = customer?.addresses?.[0];
  const [shippingName, setShippingName] = useState(customer?.name || '');
  const [shippingPhone, setShippingPhone] = useState(customer?.phone || '');
  const [shippingEmail, setShippingEmail] = useState(customer?.email || '');
  const [shippingAddress, setShippingAddress] = useState(defaultAddr?.address_line1 || '');
  const [shippingCity, setShippingCity] = useState(defaultAddr?.city || 'Varanasi');
  const [shippingState, setShippingState] = useState(defaultAddr?.state || 'Uttar Pradesh');
  const [shippingPin, setShippingPin] = useState(defaultAddr?.pin_code || '221001');
  const [gpsLocating, setGpsLocating] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setToast('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setGpsCoordinates(coordStr);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const road = addr.road || addr.suburb || addr.neighbourhood || '';
              const house = addr.house_number ? `${addr.house_number}, ` : '';
              const detectedStreet = `${house}${road}`.trim();
              if (detectedStreet && !shippingAddress) {
                setShippingAddress(`${detectedStreet} [GPS: ${coordStr}]`);
              } else if (!shippingAddress.includes('[GPS:')) {
                setShippingAddress((prev: string) => `${prev ? `${prev} ` : ''}[GPS: ${coordStr}]`.trim());
              }
              if (addr.city || addr.town || addr.village || addr.county) {
                setShippingCity(addr.city || addr.town || addr.village || addr.county);
              }
              if (addr.state) {
                setShippingState(addr.state);
              }
              if (addr.postcode) {
                setShippingPin(addr.postcode.replace(/\D/g, '').slice(0, 6));
              }
              setToast('Exact live GPS location pinned successfully!');
            } else {
              setShippingAddress((prev: string) => `${prev ? `${prev} ` : ''}[GPS: ${coordStr}]`.trim());
              setToast(`GPS coordinates pinned: ${coordStr}`);
            }
          } else {
            setShippingAddress((prev: string) => `${prev ? `${prev} ` : ''}[GPS: ${coordStr}]`.trim());
            setToast(`GPS coordinates pinned: ${coordStr}`);
          }
        } catch (err) {
          setShippingAddress((prev: string) => `${prev ? `${prev} ` : ''}[GPS: ${coordStr}]`.trim());
          setToast(`GPS coordinates pinned: ${coordStr}`);
        } finally {
          setGpsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsLocating(false);
        setToast('Unable to detect location. Please enter delivery address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (customer) {
      if (!shippingName) setShippingName(customer.name || '');
      if (!shippingPhone) setShippingPhone(customer.phone || '');
      if (!shippingEmail) setShippingEmail(customer.email || '');
      const addr = customer.addresses?.[0];
      if (addr) {
        if (!shippingAddress) setShippingAddress(addr.address_line1 || '');
        if (!shippingCity) setShippingCity(addr.city || 'Varanasi');
        if (!shippingState) setShippingState(addr.state || 'Uttar Pradesh');
        if (!shippingPin) setShippingPin(addr.pin_code || '221001');
      }
    }
  }, [customer]);

  const totals = OrderTotals({ cart, discount });
  const [submitting, setSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');
    try {
      const res = await api.post('/public/coupons/apply', {
        code: couponCode.trim(),
        cart_total: totals.subtotal,
      });
      if (res.data.success) {
        const disc = res.data.discount ?? res.data.data?.discount_amount ?? 50;
        const cId = res.data.coupon?.id || res.data.data?.id || null;
        setDiscount(disc);
        setAppliedCouponId(cId);
        setCouponMsg(`Coupon ${couponCode.toUpperCase()} applied successfully!`);
        setToast(`Saved ₹${disc} on your order`);
      } else {
        setCouponMsg(res.data.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCouponMsg(err.response?.data?.message || 'Invalid or expired coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    if (!customer) {
      setToast('Please sign in or create an account to proceed with your order.');
      setSubmitting(false);
      return;
    }

    const cleanPhone = shippingPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setToast('A valid 10-digit mobile number is mandatory for delivery.');
      setSubmitting(false);
      return;
    }

    if (!shippingAddress.trim() || !shippingCity.trim() || !shippingPin.trim()) {
      setToast('Complete delivery address, city, and PIN code are mandatory.');
      setSubmitting(false);
      return;
    }

    const orderPayload = {
      shipping_name: shippingName.trim(),
      shipping_phone: cleanPhone,
      shipping_email: shippingEmail.trim() || customer.email,
      guest_email: customer.email,
      shipping_address: shippingAddress.trim(),
      shipping_city: shippingCity.trim(),
      shipping_state: shippingState.trim(),
      shipping_pin_code: shippingPin.trim(),
      subtotal: totals.subtotal,
      discount: discount,
      shipping_fee: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      coupon_id: appliedCouponId,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
      items: cart.map((line) => ({
        product_name: line.name,
        weight_label: line.weight,
        price: line.price,
        quantity: line.quantity,
        product_variant_id: line.variantId || null,
      })),
    };

    try {
      const res = await api.post('/public/orders', orderPayload);
      if (res.data.success) {
        const orderId = res.data.data?.orderId || 'NV' + Date.now().toString().slice(-6);
        setOrderConfirmed({
          orderId,
          name: shippingName || customer.name,
          email: shippingEmail || customer.email,
          total: totals.total,
          itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        });
        clearCart();
        setToast(`Order placed successfully! Reference: ${orderId}`);
      } else {
        setToast(res.data.message || 'Error processing order');
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      const errMsg = err.response?.data?.message || 'Error recording order. Please try again.';
      setToast(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.length && !orderConfirmed) {
    return (
      <main className="billing-page section-pad">
        <div className="empty-cart">
          <ShoppingBag size={25} />
          <h2>Your bag is empty.</h2>
          <button className="button button--dark" onClick={() => navigate('/shop')}>
            Back to the collection <ArrowUpRight size={15} />
          </button>
        </div>
      </main>
    );
  }

  // Authentication Gate: Customer MUST be signed in / registered to order
  if (!customer && !orderConfirmed) {
    return (
      <>
        <section className="page-hero billing-hero">
          <p className="eyebrow">The final considered detail</p>
          <h1>Patron <em>authentication.</em></h1>
          <p>To reserve packaging batches and coordinate white-glove dispatch, please create an account or sign in with your verified 10-digit mobile number.</p>
        </section>
        <main className="billing-page section-pad" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <CustomerAuth
            onSuccess={(user) => {
              onCustomerAuth(user);
              setToast(`Welcome, ${user.name}! Delivery coordinates loaded.`);
            }}
            isEmbedded={true}
            defaultTab="register"
          />
        </main>
      </>
    );
  }

  return (
    <>
      <section className="page-hero billing-hero">
        <p className="eyebrow">The final considered detail</p>
        <h1>Billing with<br /><em>care.</em></h1>
        <p>Every order is recorded live in our warehouse system with genuine batch selection.</p>
      </section>
      <main className="billing-page section-pad">
        {orderConfirmed ? (
          <div className="billing-success">
            <div><Check size={22} /></div>
            <p className="eyebrow">Order confirmed · Reference #{orderConfirmed.orderId}</p>
            <h2>Thank you,<br /><em>{orderConfirmed.name}.</em></h2>
            <p>Your order for {orderConfirmed.itemsCount} items totalling {money(orderConfirmed.total)} has been successfully saved to our database. A confirmation note has been dispatched to {orderConfirmed.email}.</p>
            <div style={{ margin: '24px 0', padding: '16px 20px', background: 'rgba(56, 36, 63, 0.05)', borderRadius: '12px', fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '6px', color: '#2e7d32', fontWeight: 600 }}>Payment Mode: Cash on Delivery (COD)</div>
              <strong>Status: Placed & Saved in Database</strong><br />
              <span style={{ opacity: 0.75 }}>Our packaging station in Varanasi has been notified to prepare your fresh seal. Pay {money(orderConfirmed.total)} upon parcel handover.</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="button button--dark" onClick={() => navigate('/account')}>
                View in My Orders <ArrowUpRight size={15} />
              </button>
              <button className="button button--quiet" onClick={() => navigate('/shop')}>
                Continue exploring <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="billing-layout">
            <form className="billing-form" onSubmit={submit}>
              {/* Authenticated Patron Badge Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: 'rgba(183, 141, 82, 0.08)',
                border: '1px solid rgba(183, 141, 82, 0.25)',
                borderRadius: '12px',
                marginBottom: '28px',
                fontSize: '13px',
              }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--plum)' }}>
                    Patron Account: {customer?.name}
                  </span>
                  <span style={{ color: 'var(--brown-soft)', marginLeft: '10px' }}>
                    +91 {customer?.phone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c62828',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  Switch / Sign Out
                </button>
              </div>

              <div className="billing-form__header">
                <p className="eyebrow">01 · Delivery details</p>
                <h2>Where should we<br /><em>send your edit?</em></h2>
              </div>
              <div className="billing-fields">
                <label>
                  Customer name *
                  <input
                    required
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    placeholder="Your full name"
                  />
                </label>
                <label>
                  10-Digit Phone *
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                  />
                </label>
                <label>
                  Email *
                  <input
                    required
                    type="email"
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="billing-field--wide">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span>Delivery Address *</span>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={gpsLocating}
                      style={{
                        background: 'none',
                        border: '1px solid #b78d52',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#38243F',
                        cursor: gpsLocating ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#fff',
                      }}
                    >
                      <MapPin size={12} color="#b78d52" />
                      {gpsLocating ? 'Locating via GPS...' : gpsCoordinates ? '📍 GPS Location Pinned' : '📍 Auto-Detect Live GPS Location'}
                    </button>
                  </div>
                  <input
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House / flat number, street and locality (or auto-detect via GPS)"
                  />
                  {gpsCoordinates && (
                    <span style={{ fontSize: '11px', color: '#2e7d32', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> Pinpoint live GPS coordinates ({gpsCoordinates}) added for direct rider navigation.
                    </span>
                  )}
                </label>
                <label>
                  City *
                  <input
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="City"
                  />
                </label>
                <label>
                  State *
                  <input
                    required
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    placeholder="State"
                  />
                </label>
                <label>
                  PIN code *
                  <input
                    required
                    maxLength={6}
                    value={shippingPin}
                    onChange={(e) => setShippingPin(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    placeholder="221001"
                  />
                </label>
              </div>

              <div className="payment-method">
                <p className="eyebrow">02 · Payment method</p>
                <div
                  className="payment-option is-active"
                  style={{
                    cursor: 'default',
                    border: '1.5px solid var(--gold, #b78d52)',
                    background: 'rgba(183, 141, 82, 0.08)',
                    borderRadius: '10px',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={true}
                    readOnly
                    style={{ accentColor: 'var(--plum, #38243F)', width: '18px', height: '18px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--plum, #38243F)', fontWeight: 600 }}>
                        Cash on Delivery (COD)
                      </strong>
                      <span style={{
                        background: '#2e7d32',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        Active
                      </span>
                    </div>
                    <small style={{ color: 'var(--brown-soft, #6a554c)', fontSize: '12px', display: 'block', lineHeight: '1.4' }}>
                      Pay comfortably via Cash or any UPI app upon delivery at your doorstep. Zero advance payment required.
                    </small>
                  </div>
                  <BadgeCheck size={22} style={{ color: '#2e7d32', flexShrink: 0 }} />
                </div>
              </div>

              <div style={{
                margin: '22px 0 16px',
                padding: '14px 18px',
                background: 'rgba(183, 141, 82, 0.08)',
                border: '1px solid rgba(183, 141, 82, 0.25)',
                borderRadius: '12px',
                fontSize: '12px',
                lineHeight: '1.55',
                color: 'var(--brown-soft, #5a4a42)',
              }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8c5825', marginBottom: '4px', fontSize: '13px', fontWeight: 600 }}>
                  <ShieldAlert size={15} /> Strict No Return & Non-Refundable Policy Notice
                </strong>
                <span>
                  As NAAVORI items are natural perishable edible foods, orders are <strong>strictly non-returnable and non-refundable</strong> once sealed and dispatched from our facility to preserve pristine food hygiene and safety standards.
                </span>
              </div>

              <button className="button button--dark button--full" type="submit" disabled={submitting}>
                {submitting ? 'Placing order in database...' : 'Confirm Order with Cash on Delivery'} <ArrowUpRight size={15} />
              </button>
            </form>

            <aside className="billing-summary">
              <p className="eyebrow">03 · Order summary</p>
              <h2>Your<br /><em>selection.</em></h2>
              <div className="billing-summary__items">
                {cart.map((line) => (
                  <div key={line.id}>
                    <img src={line.image} alt="" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultFallbackPouch(line.category); }} />
                    <span>{line.name}<small>{line.weight} · Qty {line.quantity}</small></span>
                    <strong>{money(line.price * line.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '20px', padding: '16px 0', borderTop: '1px solid var(--line, rgba(0,0,0,0.08))', borderBottom: '1px solid var(--line, rgba(0,0,0,0.08))' }}>
                <p className="eyebrow" style={{ marginBottom: '8px' }}>Promotional code</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: '#fff', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="button button--dark"
                    style={{ padding: '10px 16px', fontSize: '12px' }}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponMsg && (
                  <small style={{ display: 'block', marginTop: '6px', color: discount > 0 ? '#2e7d32' : '#c62828', fontSize: '11px' }}>
                    {couponMsg}
                  </small>
                )}
              </div>
              <div className="cart-summary__rows">
                <span>Subtotal <strong>{money(totals.subtotal)}</strong></span>
                {discount > 0 && <span>Promotional discount <strong style={{ color: '#2e7d32' }}>-{money(discount)}</strong></span>}
                <span>Shipping <strong>{totals.shipping ? money(totals.shipping) : 'Complimentary'}</strong></span>
                <span>Tax (5% GST) <strong>{money(totals.tax)}</strong></span>
                <span className="cart-summary__total">Grand total <strong>{money(totals.total)}</strong></span>
              </div>
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(56, 36, 63, 0.04)',
                border: '1px dashed rgba(56, 36, 63, 0.18)',
                fontSize: '11px',
                color: 'var(--brown-soft)',
                lineHeight: '1.45',
              }}>
                ✦ <strong>Perishable Goods Policy:</strong> Edible items cannot be returned or refunded once dispatched.
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

function RouteFooter({ navigate, onPolicy }: { navigate: (path: string) => void; onPolicy?: (type: PolicyType) => void }) {
  return (
    <footer className="route-footer">
      <button className="footer-lockup" onClick={() => navigate('/')}><LogoImage light /></button>
      <span>Pure origins. Real goodness.</span>
      <div className="route-footer__contact">
        <span>K63/112, Nakkash · Varanasi</span>
        <a href="mailto:info@naavori.in">info@naavori.in</a>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
          <a href="tel:+918318829334" style={{ color: 'inherit', textDecoration: 'none' }}>+91 83188 29334</a> · <a href="tel:+918448170969" style={{ color: 'inherit', textDecoration: 'none' }}>+91 84481 70969</a>
        </span>
      </div>
      <div className="route-footer__actions">
        {onPolicy && (
          <>
            <button type="button" onClick={() => onPolicy('no-return')}>No-Return</button>
            <button type="button" onClick={() => onPolicy('shipping')}>Shipping</button>
            <button type="button" onClick={() => onPolicy('terms')}>Privacy & Terms</button>
          </>
        )}
        <button type="button" onClick={() => navigate('/contact')}>Contact <ArrowUpRight size={13} /></button>
        <button type="button" onClick={() => { window.location.href = '/admin'; }}>
          Admin Portal <ArrowUpRight size={13} />
        </button>
      </div>
    </footer>
  );
}

function ReviewModal({ onClose, setToast, catalogue, onReviewAdded }: { onClose: () => void; setToast: (msg: string) => void; catalogue: Product[]; onReviewAdded: (newReview: { quote: string; name: string; role: string }) => void }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !customerName.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        rating,
        comment: comment.trim(),
        title: title.trim() || 'Patron Review',
        customer_name: customerName.trim(),
        product_id: selectedProductId || undefined
      });
      if (res.data.success) {
        const prod = catalogue.find(p => p.id === selectedProductId || p.dbId === selectedProductId);
        onReviewAdded({
          quote: comment.trim(),
          name: customerName.trim(),
          role: `${prod ? prod.name : 'Verified Patron'} · verified purchase`
        });
        setToast(`Thank you, ${customerName}! Your review has been saved.`);
        onClose();
      }
    } catch {
      onReviewAdded({
        quote: comment.trim(),
        name: customerName.trim(),
        role: 'Verified Patron · verified purchase'
      });
      setToast(`Thank you, ${customerName}! Your review has been submitted.`);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="quick-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '36px' }}>
        <button className="modal-close" onClick={onClose} aria-label="Close review modal"><X size={18} /></button>
        <p className="eyebrow" style={{ color: 'var(--gold)' }}>Your Reflection</p>
        <h2 style={{ fontSize: '32px', margin: '4px 0 16px', color: 'var(--plum)' }}>Share your <em>experience.</em></h2>
        <p style={{ fontSize: '13px', color: 'var(--brown-soft)', margin: '0 0 22px' }}>
          Your words help other patrons discover India's purest harvests.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Your Rating
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="review-star-btn"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={26}
                    fill={(hoverRating || rating) >= star ? '#b78d52' : 'none'}
                    color={(hoverRating || rating) >= star ? '#b78d52' : 'rgba(56,36,63,0.25)'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#38243F', fontWeight: 600 }}>
              Your Name *
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Pooja Sharma"
                style={{ padding: '11px 14px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '8px', background: '#fff', color: '#38243F', fontFamily: 'DM Sans', fontSize: '13.5px' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#38243F', fontWeight: 600 }}>
              Select Item / Edit
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={{ padding: '11px 14px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '8px', background: '#fff', color: '#38243F', fontFamily: 'DM Sans', fontSize: '13.5px' }}
              >
                <option value="">General Experience / Hamper</option>
                {catalogue.slice(0, 15).map((p) => (
                  <option key={p.id} value={p.dbId || p.id}>{p.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#38243F', fontWeight: 600 }}>
            Headline
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unmatched freshness & royal presentation"
              style={{ padding: '11px 14px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '8px', background: '#fff', color: '#38243F', fontFamily: 'DM Sans', fontSize: '13.5px' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#38243F', fontWeight: 600 }}>
            Your Thoughts on Freshness, Flavor & Packaging *
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your ritual, texture, and aroma..."
              style={{ padding: '11px 14px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '8px', background: '#fff', color: '#38243F', fontFamily: 'DM Sans', fontSize: '13.5px', resize: 'vertical' }}
            />
          </label>

          <button disabled={submitting} type="submit" className="button button--dark button--full" style={{ marginTop: '8px' }}>
            {submitting ? 'Saving to database...' : 'Submit review'} <ArrowUpRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(window.location.pathname || '/');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('naavori-cart') ?? '[]') as CartLine[];
      if (!Array.isArray(saved)) return [];
      return saved
        .filter((line) => line && line.weight !== '1kg')
        .map((line) => {
          let img = line.image || '';
          if (img.startsWith('./assets/')) {
            img = img.replace('./assets/', '/assets/');
          } else if (img.startsWith('assets/')) {
            img = '/' + img;
          }
          if (!img || img.includes('gift-') || img.endsWith('/assets/')) {
            const cleanName = (line.name || '').toLowerCase();
            const hamper = giftHampers.find((g) => cleanName.includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(cleanName));
            if (hamper && hamper.pouches?.[0]?.image) {
              img = asset(hamper.pouches[0].image);
            } else {
              img = defaultFallbackPouch(line.category);
            }
          }
          return { ...line, image: img };
        });
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState('');
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeOrigin, setActiveOrigin] = useState<OriginKey>('Kashmir');
  const [testimonial, setTestimonial] = useState(0);
  const [newsletter, setNewsletter] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [policyModal, setPolicyModal] = useState<PolicyType | null>(null);

  const handleReorder = (items: any[]) => {
    if (!items || !items.length) return;
    const newLines: CartLine[] = items.map((item) => {
      const match = catalogue.find(p => p.name.toLowerCase() === (item.product_name || '').toLowerCase());
      const weight = (item.weight_label || '250g') as Weight;
      return {
        id: `${match?.id || item.product_name}-${weight}`,
        variantId: item.variant_id || item.product_variant_id || undefined,
        name: item.product_name,
        category: match?.category || 'Nuts',
        origin: match?.origin || 'India',
        weight,
        price: Number(item.price_per_unit || item.price || 500),
        quantity: Number(item.quantity || 1),
        image: match ? productImage(match, weight) : asset('products-official/mamra-almonds-250g.webp')
      };
    });

    setCart((current) => {
      const merged = [...current];
      for (const line of newLines) {
        const existIdx = merged.findIndex(m => m.id === line.id);
        if (existIdx > -1) {
          merged[existIdx] = { ...merged[existIdx], quantity: merged[existIdx].quantity + line.quantity };
        } else {
          merged.push(line);
        }
      }
      return merged;
    });

    setToast('Past order items added to your bag!');
    navigate('/cart');
  };

  // Restore authenticated customer session on mount
  useEffect(() => {
    api.get('/auth/customer/me')
      .then((res) => {
        if (res.data.success && res.data.data) {
          setCustomer(res.data.data);
        }
      })
      .catch(() => {
        setCustomer(null);
      });
  }, []);

  const handleCustomerLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    setCustomer(null);
    setToast('Logged out successfully.');
    navigate('/');
  };

  // Database-connected state
  const [catalogue, setCatalogue] = useState<Product[]>(initialProducts);
  const [reviewsList, setReviewsList] = useState(defaultTestimonials);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  // Sync Products from MySQL Database via Express backend
  useEffect(() => {
    api.get('/products?limit=100')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const dbProducts: Product[] = res.data.data.map((p: any) => {
            const defaultItem = initialProducts.find(
              (item) => item.packagingKey === p.slug || item.id === p.slug || item.name.toLowerCase() === p.name.toLowerCase()
            );
            const isSaffron = (p.slug || '').includes('saffron') || (p.name || '').toLowerCase().includes('saffron') || (p.name || '').includes('केसर');
            const v1gm = p.variants?.find((v: any) => v.weight_label === '1 gm' || v.weight_label === '1g');
            const v250 = p.variants?.find((v: any) => v.weight_label === '250g');
            const displayPriceNum = isSaffron && v1gm ? Number(v1gm.price) : (v250 ? Number(v250.price) : (p.starting_price ? Number(p.starting_price) : (p.variants?.[0]?.price ? Number(p.variants[0].price) : 500)));
            const calculatedPrice = `₹${Math.round(displayPriceNum).toLocaleString('en-IN')}`;
            return {
              id: p.slug || p.id,
              dbId: p.id,
              name: p.name,
              category: (p.category_name || defaultItem?.category || 'Nuts') as Category,
              origin: p.origin || defaultItem?.origin || 'India',
              description: p.description || defaultItem?.description || '',
              price: calculatedPrice,
              rating: p.rating || defaultItem?.rating || '4.9',
              imagePosition: defaultItem?.imagePosition || '50% 50%',
              packagingKey: p.packaging_key || p.slug || defaultItem?.packagingKey || 'mamra-almonds',
              tag: p.tag || defaultItem?.tag,
              imageUrl: p.image_url || undefined,
              variants: p.variants?.filter((v: any) => v.weight_label !== '1kg').map((v: any) => ({
                id: v.id,
                weight_label: v.weight_label,
                price: Number(v.price)
              }))
            };
          });

          // Merge: ensure all unique items from both DB and approved initial catalogue exist
          const merged = [...dbProducts];
          for (const init of initialProducts) {
            if (!merged.some((m) => m.packagingKey === init.packagingKey || m.id === init.id || m.name.toLowerCase() === init.name.toLowerCase())) {
              merged.push(init);
            }
          }

          const cleanMerged = merged.filter(p => !p.id.toLowerCase().includes('sindur') && !p.name.toLowerCase().includes('sindur'));
          globalCatalogue = cleanMerged;
          setCatalogue(cleanMerged);
        }
      })
      .catch((err) => {
        console.warn('Backend products sync fallback to initial catalogue:', err);
      });
  }, []);

  // Sync Reviews from MySQL Database
  useEffect(() => {
    api.get('/reviews')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map((r: any) => ({
            quote: r.comment || r.title,
            name: r.customer_name || 'Verified Patron',
            role: `${r.product_name ? `${r.product_name} · ` : ''}verified purchase`
          }));
          setReviewsList([...mapped, ...defaultTestimonials]);
        }
      })
      .catch((err) => console.warn('Reviews sync note:', err));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 1400);
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const reveal = () =>
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight * 0.9) element.classList.add('is-visible');
      });
    reveal();
    window.addEventListener('scroll', reveal, { passive: true });
    return () => window.removeEventListener('scroll', reveal);
  }, [loading, route]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    window.localStorage.setItem('naavori-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = quickView || reviewModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [quickView, reviewModalOpen]);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    history.pushState({}, '', path);
    setRoute(window.location.pathname || '/');
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleWishlist = (id: string) => {
    setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setToast(wishlist.includes(id) ? 'Removed from your edit' : 'Saved to your edit');
  };

  const addToCart = (product: Product, weight?: Weight, quantity = 1) => {
    const isSaffron = (product.id || '').toLowerCase().includes('saffron') || (product.name || '').toLowerCase().includes('saffron') || (product.name || '').includes('केसर');
    const effectiveWeight: Weight = weight || (isSaffron ? '1 gm' : '250g');
    const variantMatch = product.variants?.find((v) => v.weight_label === effectiveWeight);
    const saffronGrams = isSaffron ? (parseInt(effectiveWeight.replace(/[^0-9]/g, '')) || 1) : 1;
    const price = variantMatch
      ? variantMatch.price
      : isSaffron
        ? saffronGrams * 175
        : Math.round(numericPrice(product.price) * ((weights.find((item) => item.label === effectiveWeight)?.multiplier ?? 0.25) / 0.25));
    const id = `${product.id}-${effectiveWeight}`;

    setCart((current) => {
      const existing = current.find((line) => line.id === id);
      return existing
        ? current.map((line) => line.id === id ? { ...line, quantity: line.quantity + quantity } : line)
        : [...current, { id, variantId: variantMatch?.id, name: product.name, category: product.category, origin: product.origin, weight: effectiveWeight, price, quantity, image: productImage(product, effectiveWeight) }];
    });
    setToast(`${product.name} added to your edit`);
  };

  const addCustomToCart = (kind: BuilderKind, ids: string[], grams: number, price: number) => {
    const data = builderData[kind];
    const names = ids.map((id) => data.options.find((option) => option.id === id)?.label).filter(Boolean).join(' · ');
    const firstProduct = ids.map((id) => data.options.find((option) => option.id === id)?.productId).map((id) => id ? findProduct(id) : undefined).find((product): product is Product => Boolean(product));
    const id = `custom-${kind}-${ids.slice().sort().join('-')}-${grams}`;
    setCart((current) => [...current, { id, name: `Custom ${data.label}`, category: 'Custom edit', origin: 'NAAVORI studio', weight: `${grams}g`, price, quantity: 1, image: firstProduct ? productImage(firstProduct) : asset(data.image), custom: true }]);
    setToast(`${names || 'Your custom edit'} added to your bag`);
  };

  const addGiftToCart = (hamper: GiftHamper) => {
    const id = `gift-${hamper.id}`;
    const firstPouch = hamper.pouches[0]?.image || 'products-official/mamra-almonds-250g.webp';
    setCart((current) => {
      const existing = current.find((line) => line.id === id);
      return existing
        ? current.map((line) => line.id === id ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, {
            id,
            name: hamper.name,
            category: 'Gifting Hamper',
            origin: hamper.origin,
            weight: `${hamper.pouches.length} Pouches Set`,
            price: hamper.price,
            quantity: 1,
            image: asset(firstPouch),
            custom: true,
          }];
    });
    setToast(`${hamper.name} added to your shopping bag`);
  };

  const buyGiftNow = (hamper: GiftHamper) => {
    addGiftToCart(hamper);
    navigate('/checkout');
  };

  const updateQuantity = (id: string, delta: number) => setCart((current) => current.map((line) => line.id === id ? { ...line, quantity: Math.max(1, line.quantity + delta) } : line));
  const removeLine = (id: string) => setCart((current) => current.filter((line) => line.id !== id));
  const clearCart = () => setCart([]);
  const buyNow = (product: Product) => { addToCart(product); navigate('/checkout'); };

  const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletter.trim()) return;
    try {
      await api.post('/public/newsletter', { email: newsletter.trim() });
    } catch {
      // Ignored for graceful degradation
    }
    setNewsletterSent(true);
    setToast('Subscribed to the NAAVORI letter.');
  };

  const handleHeroMove = (event: ReactMouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--cursor-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
    target.style.setProperty('--cursor-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
  };

  const renderHome = () => <><div className="site-shell"><header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}><button className="header-brand" onClick={() => goTo('top')} aria-label="Back to top"><LogoImage /></button><nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`}><button onClick={() => navigate('/')}>Home</button><button onClick={() => navigate('/shop')}>Shop</button><button onClick={() => goTo('builders')}>Build</button><button onClick={() => goTo('gifting')}>Gifting</button><button onClick={() => goTo('origin')}>Origins</button><button onClick={() => goTo('reviews')}>Reviews</button><button onClick={() => navigate('/about')}>About</button><button onClick={() => navigate('/contact')}>Contact</button></nav><div className="header-actions"><button className={`icon-button search-button ${searchOpen ? 'search-button--open' : ''}`} onClick={() => setSearchOpen((value) => !value)} aria-label="Search">{searchOpen ? <><Search size={17} /><input autoFocus onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === 'Enter' && event.currentTarget.value) navigate(`/shop?query=${encodeURIComponent(event.currentTarget.value)}`); }} placeholder="Search ingredients" /></> : <Search size={18} />}</button><button className="icon-button" onClick={() => navigate(customer ? '/account' : '/login')} aria-label={customer ? 'Account' : 'Sign in'} title={customer ? `Signed in as ${customer.name}` : 'Sign in / Register'} style={{ position: 'relative' }}><User size={18} />{customer && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#52c41a', position: 'absolute', top: '5px', right: '5px', border: '1px solid #fff' }} />}</button><button className="icon-button" onClick={() => navigate('/wishlist')} aria-label="Wishlist"><Heart size={18} /></button><button className="icon-button cart-button" onClick={() => navigate('/cart')} aria-label="Shopping bag"><ShoppingBag size={18} /><span>{cartCount}</span></button><button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div></header><main id="top"><section className="hero" onMouseMove={handleHeroMove}><video className="hero__video" autoPlay muted loop playsInline preload="metadata" poster={asset('compositions/brand-reference.webp')}><source src={asset('hero-video.mp4')} type="video/mp4" /></video><div className="hero__veil" /><div className="hero__glow" /><div className="hero__particles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><div className="hero__content"><p className="eyebrow hero__eyebrow"><span className="eyebrow-dot" /> From India, with intention</p><h1>Pure origins.<br /><em>Real goodness.</em></h1><p className="hero__copy">A considered collection of nuts, seeds and spices — selected from India&apos;s richest regions, crafted for everyday ritual.</p><div className="hero__actions"><button className="button button--dark" onClick={() => navigate('/shop')}>Shop the collection <ArrowUpRight size={16} /></button><button className="button button--quiet" onClick={() => goTo('origin')}>Explore our origins <ArrowDownRight size={16} /></button></div></div><div className="hero__footer"><span>NAAVORI NUTS · EST. 2024</span><button onClick={() => goTo('collection')} className="scroll-cue"><span /> Scroll to discover</button><span className="hero__coordinates">15°29′N · 74°07′E</span></div></section><section className="category-strip section-pad" id="collection"><div className="section-heading section-heading--split" data-reveal><div><p className="eyebrow">01 · The pantry, considered</p><h2>Begin with something<br /><em>beautiful.</em></h2></div><p className="section-intro">Three families of ingredients. Countless ways to make the everyday more generous.</p></div><div className="category-grid">{[{ name: 'Nuts', descriptor: 'The quiet luxury of a good crunch.', image: 'compositions/category-nuts.webp', number: '01' }, { name: 'Seeds', descriptor: 'Small ingredients. Considered nourishment.', image: 'compositions/category-seeds.webp', number: '02' }, { name: 'Spices', descriptor: 'A little warmth changes everything.', image: 'compositions/category-spices.webp', number: '03' }].map((category) => <button key={category.name} className="category-card" onClick={() => navigate(`/${category.name.toLowerCase()}`)} data-reveal><span className="category-card__image" style={{ backgroundImage: `url(${asset(category.image)})`, backgroundPosition: 'center' }} /><span className="category-card__veil" /><span className="category-card__label"><small>{category.number}</small><strong>{category.name}</strong><em>{category.descriptor}</em></span><ArrowUpRight className="category-card__arrow" size={20} /></button>)}</div></section><section className="best-sellers section-pad section-pad--top" id="best-sellers"><div className="section-heading section-heading--split" data-reveal><div><p className="eyebrow">02 · The edit</p><h2>Best sellers, <em>reconsidered.</em></h2></div><button className="line-button" onClick={() => navigate('/shop')}>View all ingredients <ArrowUpRight size={15} /></button></div><ProductGrid items={catalogue.slice(0, 6)} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} buyNow={buyNow} navigate={navigate} /></section><GiftingSection navigate={navigate} onAddToCart={addGiftToCart} onBuyNow={buyGiftNow} /><section className="manifesto section-pad" id="journal"><div className="manifesto__texture" /><div className="manifesto__content" data-reveal><p className="eyebrow">A note from NAAVORI</p><blockquote>“More than just nuts.<br /><em>It&apos;s a journey of India&apos;s richest regions.</em>”</blockquote><p>We believe the best pantry staples carry a sense of place. In the way a walnut remembers a cold valley, or pepper holds the damp green air of the coast.</p><button className="line-button line-button--light" onClick={() => goTo('origin')}>Read our story <ArrowUpRight size={15} /></button></div><div className="manifesto__stamp"><LogoImage light /><span>Pure origins<br />Real goodness</span></div></section><section className="showcase section-pad" id="showcase"><div className="showcase__heading" data-reveal><div><p className="eyebrow">04 · The collection, observed</p><h2>Meet the <em>ritual.</em></h2></div><p className="section-intro">A considered still life of provenance, colour and texture — made lighter for a faster, quieter experience.</p></div><div className="showcase__stage showcase__stage--static" data-reveal><img src={asset('compositions/brand-reference.webp')} alt="NAAVORI ingredients and original brand composition" loading="lazy" /><div className="showcase__caption"><span><Sparkles size={15} /> Original compositions</span><span className="showcase__status"><i /> Selected in India</span></div></div><p className="showcase__note">Nuts · Seeds · Spices · Pure origins, real goodness.</p></section><section className="why section-pad"><div className="section-heading" data-reveal><p className="eyebrow">05 · The NAAVORI standard</p><h2>Goodness, <em>with standards.</em></h2><p className="section-intro">From the way we source to the way we seal, every detail is made to honour what nature already got right.</p></div><div className="reason-grid">{reasons.map(({ icon: Icon, eyebrow, title, copy }) => <article className="reason-card" key={title} data-reveal><span className="reason-card__number">{eyebrow}</span><Icon size={22} strokeWidth={1.4} /><h3>{title}</h3><p>{copy}</p></article>)}</div></section><BuilderShowcase navigate={navigate} addCustomToCart={addCustomToCart} /><OriginMap activeOrigin={activeOrigin} setActiveOrigin={setActiveOrigin} setQuickView={setQuickView} navigate={navigate} /><section className="reviews section-pad" id="reviews"><div className="reviews__header" data-reveal><div><p className="eyebrow">06 · Kind words & Patron reviews</p><span className="reviews__count">0{testimonial + 1} <i>/</i> 0{reviewsList.length}</span></div><button className="review-write-cta" onClick={() => setReviewModalOpen(true)}><Star size={14} fill="#b78d52" color="#b78d52" /> Write a review</button></div><div className="review-card" data-reveal><span className="review-card__quote">“</span><blockquote>{reviewsList[testimonial]?.quote}</blockquote><div className="review-card__byline"><strong>{reviewsList[testimonial]?.name}</strong><span>{reviewsList[testimonial]?.role}</span></div><div className="review-card__controls"><button onClick={() => setTestimonial((testimonial - 1 + reviewsList.length) % reviewsList.length)} aria-label="Previous review"><ChevronLeft size={18} /></button><button onClick={() => setTestimonial((testimonial + 1) % reviewsList.length)} aria-label="Next review"><ChevronRight size={18} /></button></div></div></section><section className="newsletter section-pad" id="newsletter" data-reveal><div className="newsletter__ornament">✦</div><div className="newsletter__content"><p className="eyebrow">The NAAVORI letter</p><h2>A little goodness,<br /><em>in your inbox.</em></h2><p>Seasonal stories, new harvests and considered ways to make the everyday beautiful.</p>{newsletterSent ? <div className="newsletter__success"><span>✦</span> You&apos;re on the list. See you soon.</div> : <form onSubmit={submitNewsletter}><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" required value={newsletter} onChange={(event) => setNewsletter(event.target.value)} placeholder="Your email address" /><button type="submit" aria-label="Subscribe"><ArrowUpRight size={18} /></button></form>}<small>By subscribing, you agree to hear from us. No noise, ever.</small></div><span className="newsletter__leaf newsletter__leaf--one" /><span className="newsletter__leaf newsletter__leaf--two" /></section></main><footer className="site-footer"><div className="site-footer__top"><div className="footer-brand"><button className="footer-lockup" onClick={() => goTo('top')}><LogoImage light /></button><p>Pure origins. Real goodness.<br />Rooted in India, crafted for tomorrow.</p><p className="footer-contact">K63/112, Nakkash · Bhoot Bhairav<br />Varanasi – 221001<br /><a href="mailto:info@naavori.in">info@naavori.in</a><br /><a href="tel:+918318829334">+91 83188 29334</a> · <a href="tel:+918448170969">+91 84481 70969</a></p></div><div className="footer-column"><p className="eyebrow">Discover</p><button onClick={() => goTo('collection')}>The collection</button><button onClick={() => goTo('gifting')}>Gifting & hampers</button><button onClick={() => goTo('origin')}>Our origins</button><button onClick={() => goTo('builders')}>Build your edit</button><button onClick={() => goTo('reviews')}>Patron reviews</button></div><div className="footer-column"><p className="eyebrow">Care</p><button onClick={() => navigate('/contact')}>Contact us</button><button onClick={() => setPolicyModal('no-return')}>No-Return Policy</button><button onClick={() => setPolicyModal('shipping')}>Shipping & Delivery</button><button onClick={() => setPolicyModal('terms')}>Privacy & Terms</button><button onClick={() => { window.location.href = '/admin'; }} style={{ color: '#D4AF37' }}>Admin Portal ↗</button></div><div className="footer-column"><p className="eyebrow">Your edit</p><button onClick={() => navigate('/wishlist')}>Wishlist <Heart size={13} /></button><button onClick={() => navigate('/cart')}>Shopping bag <ShoppingBag size={13} /></button><button onClick={() => navigate('/contact')}>Concierge <Mail size={13} /></button></div></div><div className="site-footer__bottom"><span>© 2024 NAAVORI NUTS</span><span>Made with intention in India</span><button onClick={() => setPolicyModal('terms')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 0 }}>Privacy · Terms</button><a href="/admin" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', marginLeft: '12px', fontSize: '12px' }}>Staff & Admin Access ↗</a></div></footer></div></>;

  const detailProduct = route.startsWith('/product/') ? catalogue.find((item) => item.id === route.split('/')[2] || item.packagingKey === route.split('/')[2]) : undefined;
  let routePage: ReactNode;
  if (detailProduct) routePage = <ProductDetailPage product={detailProduct} liked={wishlist.includes(detailProduct.id)} toggleWishlist={() => toggleWishlist(detailProduct.id)} addToCart={addToCart} navigate={navigate} />;
  else if (route === '/shop') routePage = <ShopPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} buyNow={buyNow} navigate={navigate} catalogue={catalogue} />;
  else if (route === '/gifting') routePage = <GiftingPage navigate={navigate} onAddToCart={addGiftToCart} onBuyNow={buyGiftNow} setToast={setToast} />;
  else if (route === '/nuts' || route === '/seeds' || route === '/spices') routePage = <CategoryPage kind={route.slice(1).replace(/^./, (letter) => letter.toUpperCase()) as Category} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} buyNow={buyNow} navigate={navigate} catalogue={catalogue} />;
  else if (route.startsWith('/build/')) routePage = <BuilderPage kind={route.split('/')[2] as BuilderKind} addCustomToCart={addCustomToCart} navigate={navigate} />;
  else if (route === '/cart') routePage = <CartPage cart={cart} updateQuantity={updateQuantity} removeLine={removeLine} navigate={navigate} />;
  else if (route === '/checkout') routePage = <BillingPage cart={cart} navigate={navigate} setToast={setToast} clearCart={clearCart} customer={customer} onCustomerAuth={(u) => setCustomer(u)} onLogout={handleCustomerLogout} />;
  else if (route === '/login') routePage = (
    <main className="section-pad" style={{ minHeight: '640px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CustomerAuth
        onSuccess={(u) => {
          setCustomer(u);
          setToast(`Welcome back, ${u.name}!`);
          navigate('/account');
        }}
        navigate={navigate}
        defaultTab="login"
      />
    </main>
  );
  else if (route === '/account') routePage = customer ? (
    <CustomerAccount customer={customer} onLogout={handleCustomerLogout} navigate={navigate} onReorder={handleReorder} />
  ) : (
    <main className="section-pad" style={{ minHeight: '640px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CustomerAuth
        onSuccess={(u) => {
          setCustomer(u);
          setToast(`Welcome back, ${u.name}!`);
        }}
        navigate={navigate}
        defaultTab="login"
      />
    </main>
  );
  else if (route === '/wishlist') routePage = <WishlistPage wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} buyNow={buyNow} navigate={navigate} />;
  else if (route === '/contact') routePage = <ContactPage setToast={setToast} />;
  else routePage = <SimplePage type={route === '/our-story' ? 'our-story' : 'about'} navigate={navigate} />;

  if (route !== '/') return <><LoadingScreen done={!loading} /><RouteChrome route={route} navigate={navigate} cartCount={cartCount} wishlistCount={wishlist.length} customer={customer} />{routePage}<RouteFooter navigate={navigate} onPolicy={(p) => setPolicyModal(p)} />{toast && <div className="toast" role="status"><span>✦</span>{toast}</div>}{quickView && <QuickViewModal product={quickView} addToCart={addToCart} setQuickView={setQuickView} />}{reviewModalOpen && <ReviewModal onClose={() => setReviewModalOpen(false)} setToast={setToast} catalogue={catalogue} onReviewAdded={(newR) => { setReviewsList(prev => [newR, ...prev]); setTestimonial(0); }} />}<FloatingConcierge />{policyModal && <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />}</>;
  return <><LoadingScreen done={!loading} />{renderHome()}{toast && <div className="toast" role="status"><span>✦</span>{toast}</div>}{quickView && <QuickViewModal product={quickView} addToCart={addToCart} setQuickView={setQuickView} />}{reviewModalOpen && <ReviewModal onClose={() => setReviewModalOpen(false)} setToast={setToast} catalogue={catalogue} onReviewAdded={(newR) => { setReviewsList(prev => [newR, ...prev]); setTestimonial(0); }} />}<FloatingConcierge />{policyModal && <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />}</>;
}

function QuickViewModal({ product, addToCart, setQuickView }: { product: Product; addToCart: (product: Product) => void; setQuickView: (product: Product | null) => void }) {
  return <div className="modal-backdrop" onClick={() => setQuickView(null)}><div className="quick-modal" role="dialog" aria-modal="true" aria-label={`Quick view ${product.name}`} onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setQuickView(null)} aria-label="Close quick view"><X size={18} /></button><ProductImage product={product} eager /><div className="quick-modal__content"><p className="eyebrow">{product.category} · {product.origin}</p><h2>{product.name}</h2><p>{product.description}</p><div className="quick-modal__price"><strong>{product.price}</strong><span>★ {product.rating} · Selected quality</span></div><div style={{ fontSize: '11px', color: 'var(--brown-soft)', margin: '10px 0 14px', display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldAlert size={13} color="#8c5825" /> <span>Perishable Gourmet Food · Non-Returnable</span></div><PinCodeChecker /><button className="button button--dark button--full" onClick={() => { addToCart(product); setQuickView(null); }}>Add to your edit <ShoppingBag size={15} /></button></div></div></div>;
}

export default App;
