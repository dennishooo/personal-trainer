/**
 * Nutrition reference for every ingredient the meal plan cooks with, plus the
 * common cuts you'd meet ordering out or at the butcher.
 *
 * Values are per 100 g raw edible weight (USDA FoodData Central, with HK Centre
 * for Food Safety figures for the Chinese items). Cuts matter more than species:
 * chicken runs 109 kcal at the tenderloin and 290 at the wing, pork 143 at the
 * tenderloin and 518 at the belly — so meat is broken out by cut, not lumped.
 *
 * Bone-in cuts are quoted as edible meat; the raw weight you buy includes bone.
 */

import type { IconName } from '@/components/icons'

/** Fat per 100 g: lean < 8 g, medium 8-17 g, fatty > 17 g. */
export type Leanness = 'lean' | 'medium' | 'fatty'


export interface NutritionItem {
  name: string
  chinese?: string
  icon: IconName
  /** Anatomical cut or product form, where the group is broken out that way. */
  cut?: string
  leanness?: Leanness
  kcal: number
  proteinG: number
  carbG: number
  fatG: number
  /** Serving used in the meal plan, or a typical serving for reference-only items. */
  portion: string
  /** True when this exact item appears in the meal plan. */
  inPlan?: boolean
  note?: string
}

export interface NutritionGroup {
  name: string
  icon: IconName
  items: NutritionItem[]
}

export const NUTRITION_GROUPS: NutritionGroup[] = [
  {
    name: 'Chicken & poultry cuts',
    icon: 'meat',
    items: [
      { name: 'Chicken breast, skinless', chinese: '雞胸肉', icon: 'meat', cut: 'Breast', leanness: 'lean', kcal: 120, proteinG: 22.5, carbG: 0, fatG: 2.6, portion: '170 g', inPlan: true, note: 'The plan\'s default. Leanest high-volume protein here' },
      { name: 'Chicken breast, skin on', chinese: '帶皮雞胸', icon: 'meat', cut: 'Breast', leanness: 'medium', kcal: 172, proteinG: 20.8, carbG: 0, fatG: 9.3, portion: '170 g', note: 'The skin alone adds ~50 kcal per 100 g' },
      { name: 'Chicken thigh, skinless', chinese: '去皮雞髀', icon: 'meat', cut: 'Thigh', leanness: 'lean', kcal: 145, proteinG: 19.7, carbG: 0, fatG: 7, portion: '150 g', inPlan: true, note: 'Forgiving in stir-fries; won\'t dry out' },
      { name: 'Chicken thigh, skin on', chinese: '帶皮雞髀', icon: 'meat', cut: 'Thigh', leanness: 'medium', kcal: 221, proteinG: 16.5, carbG: 0, fatG: 17, portion: '150 g', note: 'Nearly double the skinless breast, calorie for gram' },
      { name: 'Chicken drumstick, skinless', chinese: '雞下腿', icon: 'meat', cut: 'Leg', leanness: 'lean', kcal: 135, proteinG: 20.1, carbG: 0, fatG: 5.7, portion: '2 (140 g)', note: 'Bone is ~30% of raw weight — weigh the meat' },
      { name: 'Chicken wing, skin on', chinese: '雞翼', icon: 'meat', cut: 'Wing', leanness: 'fatty', kcal: 290, proteinG: 18.3, carbG: 0, fatG: 24, portion: '3 (90 g)', note: 'Highest-fat chicken cut; mostly skin' },
      { name: 'Chicken tenderloin', chinese: '雞柳', icon: 'meat', cut: 'Breast', leanness: 'lean', kcal: 109, proteinG: 23.2, carbG: 0, fatG: 1.3, portion: '170 g', note: 'Leaner than breast; cooks in half the time' },
      { name: 'Chicken mince', chinese: '雞肉碎', icon: 'meat', cut: 'Mince', leanness: 'medium', kcal: 143, proteinG: 17.4, carbG: 0, fatG: 8.1, portion: '150 g', inPlan: true, note: 'Fat varies — ask for breast mince' },
      { name: 'Chicken liver', chinese: '雞肝', icon: 'meat', cut: 'Offal', leanness: 'lean', kcal: 119, proteinG: 16.9, carbG: 0.7, fatG: 4.8, portion: '80 g', note: 'Very high vitamin A — don\'t eat daily' },
      { name: 'Sliced turkey breast', chinese: '火雞胸片', icon: 'meat', cut: 'Breast', leanness: 'lean', kcal: 104, proteinG: 17.1, carbG: 3.5, fatG: 1.7, portion: '80 g', inPlan: true, note: 'Deli slices carry added salt and sugar' },
      { name: 'Duck breast, skinless', chinese: '去皮鴨胸', icon: 'meat', cut: 'Breast', leanness: 'lean', kcal: 123, proteinG: 19.9, carbG: 0, fatG: 4.3, portion: '150 g', note: 'Leaner than you\'d expect once the skin is off' },
      { name: 'Roast duck, skin on', chinese: '燒鴨', icon: 'meat', cut: 'Whole', leanness: 'fatty', kcal: 337, proteinG: 19, carbG: 0, fatG: 28.4, portion: '100 g', note: 'Cha chaan teng staple — the skin carries the calories' },
    ],
  },
  {
    name: 'Eggs',
    icon: 'egg',
    items: [
      { name: 'Egg, whole large', chinese: '雞蛋', icon: 'egg', cut: 'Whole', leanness: 'medium', kcal: 143, proteinG: 12.6, carbG: 0.7, fatG: 9.5, portion: '2 eggs (100 g)', inPlan: true, note: 'One large egg ≈ 50 g, 72 kcal, 6.3 g protein' },
      { name: 'Egg white only', chinese: '蛋白', icon: 'egg', cut: 'White', leanness: 'lean', kcal: 52, proteinG: 10.9, carbG: 0.7, fatG: 0.2, portion: '3 whites (100 g)', note: 'Swap 1 whole egg for 2 whites to cut ~40 kcal' },
      { name: 'Egg yolk only', chinese: '蛋黃', icon: 'egg', cut: 'Yolk', leanness: 'fatty', kcal: 322, proteinG: 15.9, carbG: 3.6, fatG: 26.5, portion: '1 yolk (17 g)', note: 'All the fat, choline and vitamin D live here' },
      { name: 'Century egg', chinese: '皮蛋', icon: 'egg-fried', cut: 'Preserved', leanness: 'medium', kcal: 170, proteinG: 13.6, carbG: 4, fatG: 11, portion: '1 (55 g)', inPlan: true, note: 'High sodium — one is plenty' },
    ],
  },
  {
    name: 'Beef cuts',
    icon: 'meat',
    items: [
      { name: 'Beef fillet / tenderloin', chinese: '牛柳', icon: 'meat', cut: 'Loin', leanness: 'lean', kcal: 158, proteinG: 21.6, carbG: 0, fatG: 7.8, portion: '150 g', note: 'Leanest steak cut worth grilling' },
      { name: 'Beef sirloin, trimmed', chinese: '西冷', icon: 'meat', cut: 'Loin', leanness: 'lean', kcal: 130, proteinG: 22.5, carbG: 0, fatG: 4.1, portion: '150 g', note: 'Trim the fat cap and it beats fillet on macros' },
      { name: 'Beef flank steak', chinese: '牛腩扒', icon: 'meat', cut: 'Flank', leanness: 'medium', kcal: 192, proteinG: 21.2, carbG: 0, fatG: 11.6, portion: '150 g', inPlan: true, note: 'Slice against the grain or it eats tough' },
      { name: 'Beef ribeye', chinese: '肉眼', icon: 'meat', cut: 'Rib', leanness: 'fatty', kcal: 291, proteinG: 19.4, carbG: 0, fatG: 23.5, portion: '150 g', note: 'Marbling is the point — and the calories' },
      { name: 'Beef short rib', chinese: '牛小排', icon: 'meat', cut: 'Rib', leanness: 'fatty', kcal: 380, proteinG: 15.1, carbG: 0, fatG: 35.7, portion: '120 g', note: 'Fattiest cut here; Korean BBQ default' },
      { name: 'Beef brisket', chinese: '牛腩', icon: 'meat', cut: 'Brisket', leanness: 'fatty', kcal: 251, proteinG: 18.7, carbG: 0, fatG: 19.2, portion: '150 g', note: 'Lean-trimmed brisket drops to about 155 kcal' },
      { name: 'Beef shin / shank', chinese: '牛腱', icon: 'meat', cut: 'Shank', leanness: 'lean', kcal: 145, proteinG: 21.8, carbG: 0, fatG: 6, portion: '150 g', note: 'Collagen-rich; needs a long braise' },
      { name: 'Lean beef mince (5% fat)', chinese: '瘦牛肉碎', icon: 'meat', cut: 'Mince', leanness: 'lean', kcal: 137, proteinG: 21.4, carbG: 0, fatG: 5, portion: '150 g', inPlan: true, note: 'The plan assumes this grade' },
      { name: 'Beef mince (15% fat)', chinese: '牛肉碎', icon: 'meat', cut: 'Mince', leanness: 'medium', kcal: 215, proteinG: 18.6, carbG: 0, fatG: 15, portion: '150 g', note: 'The default at most butchers — check before buying' },
      { name: 'Beef mince (20% fat)', chinese: '肥牛肉碎', icon: 'meat', cut: 'Mince', leanness: 'fatty', kcal: 254, proteinG: 17.2, carbG: 0, fatG: 20, portion: '150 g', note: 'Nearly double the lean grade per gram' },
    ],
  },
  {
    name: 'Pork cuts',
    icon: 'meat',
    items: [
      { name: 'Pork tenderloin', chinese: '豬柳', icon: 'meat', cut: 'Loin', leanness: 'lean', kcal: 143, proteinG: 21.1, carbG: 0, fatG: 5.9, portion: '150 g', note: 'As lean as chicken thigh; the cut to default to' },
      { name: 'Pork loin chop, trimmed', chinese: '豬扒', icon: 'meat', cut: 'Loin', leanness: 'lean', kcal: 152, proteinG: 21.4, carbG: 0, fatG: 6.9, portion: '150 g', note: 'Untrimmed with the fat rim, closer to 210 kcal' },
      { name: 'Pork shoulder / butt', chinese: '梅頭', icon: 'meat', cut: 'Shoulder', leanness: 'medium', kcal: 211, proteinG: 18.2, carbG: 0, fatG: 15, portion: '130 g', note: 'Char siu cut — before the sugar glaze' },
      { name: 'Pork belly', chinese: '五花腩', icon: 'meat', cut: 'Belly', leanness: 'fatty', kcal: 518, proteinG: 9.3, carbG: 0, fatG: 53, portion: '80 g', note: 'Highest-calorie item on this page. Treat as a garnish' },
      { name: 'Pork ribs', chinese: '排骨', icon: 'meat', cut: 'Rib', leanness: 'fatty', kcal: 277, proteinG: 20.4, carbG: 0, fatG: 21.2, portion: '150 g raw', note: 'Bone is ~40% of raw weight' },
      { name: 'Lean pork mince', chinese: '瘦豬肉碎', icon: 'meat', cut: 'Mince', leanness: 'lean', kcal: 143, proteinG: 21.1, carbG: 0, fatG: 5.9, portion: '120 g', inPlan: true, note: 'Standard mince is closer to 260 kcal' },
      { name: 'Pork mince, standard', chinese: '豬肉碎', icon: 'meat', cut: 'Mince', leanness: 'fatty', kcal: 263, proteinG: 16.9, carbG: 0, fatG: 21.2, portion: '120 g', note: 'What you get by default unless you ask' },
      { name: 'Char siu', chinese: '叉燒', icon: 'meat', cut: 'Prepared', leanness: 'medium', kcal: 245, proteinG: 19, carbG: 12, fatG: 13.5, portion: '100 g', note: 'The glaze adds the carbs; lean char siu is leaner' },
    ],
  },
  {
    name: 'Fish',
    icon: 'fish',
    items: [
      { name: 'Salmon fillet, skin on', chinese: '三文魚', icon: 'fish', cut: 'Oily', leanness: 'medium', kcal: 208, proteinG: 20.4, carbG: 0, fatG: 13.4, portion: '170 g', inPlan: true, note: 'About 2.3 g omega-3 per 100 g' },
      { name: 'Salmon belly', chinese: '三文魚腩', icon: 'fish', cut: 'Oily', leanness: 'fatty', kcal: 290, proteinG: 17.5, carbG: 0, fatG: 24.5, portion: '120 g', note: 'Fattiest part of the fish; most omega-3 too' },
      { name: 'Sea bass, whole or fillet', chinese: '鱸魚', icon: 'fish', cut: 'White', leanness: 'lean', kcal: 97, proteinG: 18.4, carbG: 0, fatG: 2, portion: '300 g whole', inPlan: true, note: 'Whole fish is ~45% edible after bones' },
      { name: 'Cod fillet', chinese: '鱈魚', icon: 'fish', cut: 'White', leanness: 'lean', kcal: 82, proteinG: 17.8, carbG: 0, fatG: 0.7, portion: '170 g', note: 'Leanest fish here; dries out fast' },
      { name: 'Tuna steak, fresh', chinese: '吞拿魚扒', icon: 'fish', cut: 'Oily', leanness: 'lean', kcal: 144, proteinG: 23.3, carbG: 0, fatG: 4.9, portion: '150 g', note: 'Bluefin is far fattier than yellowfin' },
      { name: 'Canned tuna in water', chinese: '水浸吞拿魚', icon: 'fish', cut: 'Canned', leanness: 'lean', kcal: 116, proteinG: 25.5, carbG: 0, fatG: 0.8, portion: '1 tin (100 g)', inPlan: true, note: 'Best protein-per-calorie on this page' },
      { name: 'Canned tuna in oil, drained', chinese: '油浸吞拿魚', icon: 'fish', cut: 'Canned', leanness: 'medium', kcal: 186, proteinG: 24.9, carbG: 0, fatG: 8.2, portion: '1 tin (100 g)', note: 'Draining removes some but not most of the oil' },
      { name: 'Mackerel', chinese: '鯖魚', icon: 'fish', cut: 'Oily', leanness: 'medium', kcal: 205, proteinG: 18.6, carbG: 0, fatG: 13.9, portion: '150 g', note: 'Cheapest high-omega-3 option' },
    ],
  },
  {
    name: 'Shellfish & seafood',
    icon: 'fish',
    items: [
      { name: 'Prawns, peeled raw', chinese: '蝦仁', icon: 'fish', cut: 'Shellfish', leanness: 'lean', kcal: 85, proteinG: 20.1, carbG: 0.2, fatG: 0.5, portion: '150 g', inPlan: true, note: 'Very lean; overcooks in about a minute' },
      { name: 'Clams, shelled', chinese: '蜆肉', icon: 'fish', cut: 'Shellfish', leanness: 'lean', kcal: 86, proteinG: 14.7, carbG: 3, fatG: 1, portion: '150 g', inPlan: true, note: 'Iron and B12 heavyweight' },
      { name: 'Squid', chinese: '魷魚', icon: 'fish', cut: 'Cephalopod', leanness: 'lean', kcal: 92, proteinG: 15.6, carbG: 3.1, fatG: 1.4, portion: '150 g', note: 'Cook fast or very slow — nothing in between' },
      { name: 'Scallops', chinese: '帶子', icon: 'fish', cut: 'Shellfish', leanness: 'lean', kcal: 69, proteinG: 12.1, carbG: 3.2, fatG: 0.5, portion: '120 g' },
      { name: 'Anchovy stock', chinese: '鯷魚高湯', icon: 'soup', cut: 'Stock', leanness: 'lean', kcal: 8, proteinG: 1, carbG: 0.6, fatG: 0.2, portion: '400 ml', inPlan: true, note: 'Effectively free calories; watch sodium' },
    ],
  },
  {
    name: 'Soy & plant protein',
    icon: 'cheese',
    items: [
      { name: 'Firm tofu', chinese: '硬豆腐', icon: 'cheese', kcal: 144, proteinG: 15.8, carbG: 4.3, fatG: 8.7, portion: '200 g', note: 'Press it — water is most of the weight' },
      { name: 'Silken tofu', chinese: '滑豆腐', icon: 'cheese', kcal: 55, proteinG: 4.8, carbG: 2, fatG: 3, portion: '300 g', note: 'A third the protein of firm, by weight' },
      { name: 'Natto', chinese: '納豆', icon: 'bowl-spoon', kcal: 211, proteinG: 19.4, carbG: 12.7, fatG: 11, portion: '1 pack (45 g)', note: 'Vitamin K2 and fermented fibre' },
      { name: 'Edamame, shelled', chinese: '毛豆', icon: 'salad', kcal: 121, proteinG: 11.9, carbG: 8.9, fatG: 5.2, portion: '150 g pods ≈ 75 g beans', note: 'Pods are inedible — weigh shelled' },
      { name: 'Unsweetened soy milk', chinese: '無糖豆漿', icon: 'milk', kcal: 33, proteinG: 3.3, carbG: 1.2, fatG: 1.8, portion: '300 ml', note: 'Sweetened adds 6–8 g sugar per 100 ml' },
      { name: 'Whey protein isolate', chinese: '乳清蛋白', icon: 'cup', kcal: 375, proteinG: 82, carbG: 6, fatG: 2.5, portion: '1 scoop (30 g)', note: 'One scoop ≈ 113 kcal, 25 g protein' },
      { name: 'Soy protein isolate', chinese: '大豆蛋白', icon: 'cup', kcal: 370, proteinG: 80, carbG: 7, fatG: 1.5, portion: '1 scoop (30 g)', note: 'Dairy-free swap; slightly chalkier' },
    ],
  },
  {
    name: 'Dairy',
    icon: 'milk',
    items: [
      { name: 'Greek yoghurt, 2% fat', chinese: '希臘乳酪', icon: 'bowl-spoon', kcal: 73, proteinG: 9.9, carbG: 3.9, fatG: 1.9, portion: '200 g', note: 'Regular yoghurt has about half the protein' },
      { name: 'Milk, semi-skimmed', chinese: '半脫脂奶', icon: 'milk', kcal: 47, proteinG: 3.4, carbG: 4.8, fatG: 1.7, portion: '250 ml', note: 'Whole milk is 64 kcal per 100 ml' },
    ],
  },
  {
    name: 'Grains & starch',
    icon: 'bowl-chopsticks',
    items: [
      { name: 'Rolled oats, dry', chinese: '燕麥片', icon: 'bowl-spoon', kcal: 379, proteinG: 13.2, carbG: 67.7, fatG: 6.5, portion: '60 g dry', note: 'Weigh dry — cooked triples in volume' },
      { name: 'Brown rice, cooked', chinese: '糙米飯', icon: 'bowl-chopsticks', kcal: 123, proteinG: 2.7, carbG: 25.6, fatG: 1, portion: '180 g', note: 'Dry weight is about a third of cooked' },
      { name: 'White rice, cooked', chinese: '白飯', icon: 'bowl-chopsticks', kcal: 130, proteinG: 2.7, carbG: 28.2, fatG: 0.3, portion: '180 g', note: 'Near-identical to brown; less fibre' },
      { name: 'Rice noodles, dry', chinese: '米粉', icon: 'bowl-chopsticks', kcal: 364, proteinG: 6.2, carbG: 81.6, fatG: 0.6, portion: '80 g dry', note: 'Cooked, that\'s roughly 220 g' },
      { name: 'Wholemeal tortilla', chinese: '全麥薄餅', icon: 'bread', kcal: 313, proteinG: 9, carbG: 48, fatG: 8, portion: '1 (60 g)', note: 'Check the label — sizes vary widely' },
      { name: 'Toasted rice powder', chinese: '炒米粉', icon: 'droplet', kcal: 380, proteinG: 7, carbG: 82, fatG: 1, portion: '1 tbsp (8 g)', note: 'There for texture, not calories' },
      { name: 'Konjac pearls', chinese: '蒟蒻珠', icon: 'bubble-tea', kcal: 10, proteinG: 0.1, carbG: 3, fatG: 0, portion: '80 g', note: 'Near-zero-calorie tapioca substitute' },
      { name: 'Cornstarch', chinese: '生粉', icon: 'droplet', kcal: 381, proteinG: 0.3, carbG: 91.3, fatG: 0.1, portion: '1 tsp (3 g)', note: 'A slurry adds ~11 kcal to the whole dish' },
    ],
  },
  {
    name: 'Vegetables & aromatics',
    icon: 'salad',
    items: [
      { name: 'Broccoli', chinese: '西蘭花', icon: 'salad', kcal: 34, proteinG: 2.8, carbG: 6.6, fatG: 0.4, portion: '150 g', note: '2.6 g fibre per 100 g' },
      { name: 'Gai lan', chinese: '芥蘭', icon: 'salad', kcal: 22, proteinG: 1.9, carbG: 3.5, fatG: 0.4, portion: '150 g', note: 'Calcium-dense brassica' },
      { name: 'Choy sum', chinese: '菜心', icon: 'salad', kcal: 20, proteinG: 1.8, carbG: 2.9, fatG: 0.3, portion: '150 g', note: 'Stems need a minute longer than leaves' },
      { name: 'Spinach', chinese: '菠菜', icon: 'salad', kcal: 23, proteinG: 2.9, carbG: 3.6, fatG: 0.4, portion: '100 g', note: 'Wilts to about a fifth of raw volume' },
      { name: 'Bean sprouts', chinese: '豆芽', icon: 'salad', kcal: 30, proteinG: 3, carbG: 5.9, fatG: 0.2, portion: '100 g', note: 'Add at the very end for crunch' },
      { name: 'Carrot', chinese: '紅蘿蔔', icon: 'carrot', kcal: 41, proteinG: 0.9, carbG: 9.6, fatG: 0.2, portion: '60 g' },
      { name: 'Cucumber', chinese: '青瓜', icon: 'salad', kcal: 15, proteinG: 0.7, carbG: 3.6, fatG: 0.1, portion: '100 g' },
      { name: 'Lettuce', chinese: '生菜', icon: 'salad', kcal: 15, proteinG: 1.4, carbG: 2.9, fatG: 0.2, portion: '6 cups (80 g)' },
      { name: 'Onion', chinese: '洋蔥', icon: 'apple', kcal: 40, proteinG: 1.1, carbG: 9.3, fatG: 0.1, portion: '80 g' },
      { name: 'Kimchi', chinese: '泡菜', icon: 'pepper', kcal: 15, proteinG: 1.1, carbG: 2.4, fatG: 0.5, portion: '100 g', note: '500–900 mg sodium per 100 g' },
      { name: 'Ginger, fresh', chinese: '薑', icon: 'mushroom', kcal: 80, proteinG: 1.8, carbG: 17.8, fatG: 0.8, portion: '10 g', note: 'Used in grams — negligible either way' },
      { name: 'Garlic', chinese: '蒜', icon: 'mushroom', kcal: 149, proteinG: 6.4, carbG: 33.1, fatG: 0.5, portion: '2 cloves (6 g)', note: 'Negligible at cooking quantities' },
      { name: 'Spring onion', chinese: '蔥', icon: 'salad', kcal: 32, proteinG: 1.8, carbG: 7.3, fatG: 0.2, portion: '15 g' },
      { name: 'Shallot', chinese: '乾蔥', icon: 'apple', kcal: 72, proteinG: 2.5, carbG: 16.8, fatG: 0.1, portion: '20 g' },
      { name: 'Coriander / mint', chinese: '芫荽 / 薄荷', icon: 'salad', kcal: 23, proteinG: 2.1, carbG: 3.7, fatG: 0.5, portion: '15 g' },
    ],
  },
  {
    name: 'Fats, nuts & seeds',
    icon: 'avocado',
    items: [
      { name: 'Neutral cooking oil', chinese: '食油', icon: 'droplet', kcal: 884, proteinG: 0, carbG: 0, fatG: 100, portion: '1 tbsp (14 g)', note: '124 kcal a tablespoon — the easiest overshoot' },
      { name: 'Sesame oil', chinese: '麻油', icon: 'droplet', kcal: 884, proteinG: 0, carbG: 0, fatG: 100, portion: '1 tsp (5 g)', note: 'Finishing oil; a few drops is enough' },
      { name: 'Walnuts', chinese: '核桃', icon: 'avocado', kcal: 654, proteinG: 15.2, carbG: 13.7, fatG: 65.2, portion: '20 g', note: 'Best plant source of ALA omega-3' },
      { name: 'Sesame seeds', chinese: '芝麻', icon: 'droplet', kcal: 573, proteinG: 17.7, carbG: 23.4, fatG: 49.7, portion: '1 tbsp (9 g)' },
      { name: 'Black sesame powder', chinese: '黑芝麻粉', icon: 'droplet', kcal: 573, proteinG: 17.7, carbG: 23.4, fatG: 49.7, portion: '15 g', note: 'Same as the seeds; ground absorbs better' },
    ],
  },
  {
    name: 'Fruit & sweeteners',
    icon: 'apple',
    items: [
      { name: 'Banana', chinese: '香蕉', icon: 'apple', kcal: 89, proteinG: 1.1, carbG: 22.8, fatG: 0.3, portion: '1 medium (118 g)' },
      { name: 'Mixed berries', chinese: '雜莓', icon: 'apple', kcal: 50, proteinG: 0.9, carbG: 11.6, fatG: 0.4, portion: '100 g', note: 'Frozen is nutritionally equal to fresh' },
      { name: 'Honey', chinese: '蜂蜜', icon: 'droplet', kcal: 304, proteinG: 0.3, carbG: 82.4, fatG: 0, portion: '1 tsp (7 g)', note: '21 kcal a teaspoon, all sugar' },
      { name: 'Lime juice', chinese: '青檸汁', icon: 'lemon', kcal: 25, proteinG: 0.4, carbG: 8.4, fatG: 0.1, portion: '1 lime (30 ml)' },
    ],
  },
  {
    name: 'Sauces & seasoning',
    icon: 'droplet',
    items: [
      { name: 'Soy sauce', chinese: '豉油', icon: 'droplet', kcal: 53, proteinG: 8.1, carbG: 4.9, fatG: 0.6, portion: '1 tbsp (16 ml)', note: 'About 900 mg sodium per tablespoon' },
      { name: 'Oyster sauce', chinese: '蠔油', icon: 'droplet', kcal: 51, proteinG: 1.4, carbG: 10.9, fatG: 0.3, portion: '1 tbsp (18 g)' },
      { name: 'Fish sauce', chinese: '魚露', icon: 'droplet', kcal: 35, proteinG: 5.1, carbG: 3.6, fatG: 0, portion: '1 tbsp (18 ml)', note: 'About 1400 mg sodium per tablespoon' },
      { name: 'Gochujang', chinese: '辣椒醬', icon: 'flame', kcal: 214, proteinG: 5.4, carbG: 44, fatG: 1.6, portion: '1 tbsp (18 g)', note: 'Sugar is the second ingredient' },
      { name: 'Doubanjiang', chinese: '豆瓣醬', icon: 'flame', kcal: 165, proteinG: 9, carbG: 18, fatG: 6, portion: '1 tbsp (16 g)', note: 'Very salty; season the dish afterwards' },
      { name: 'Hoisin sauce', chinese: '海鮮醬', icon: 'flame', kcal: 220, proteinG: 3.3, carbG: 44, fatG: 3.4, portion: '1 tbsp (16 g)' },
      { name: 'Mirin', chinese: '味醂', icon: 'droplet', kcal: 258, proteinG: 0.2, carbG: 43, fatG: 0, portion: '1 tbsp (18 ml)', note: 'Mostly sugar and alcohol' },
      { name: 'Shaoxing wine', chinese: '紹興酒', icon: 'droplet', kcal: 130, proteinG: 0.3, carbG: 5, fatG: 0, portion: '1 tbsp (15 ml)', note: 'Alcohol cooks off; the sugar stays' },
      { name: 'Dashi', chinese: '出汁', icon: 'soup', kcal: 5, proteinG: 0.6, carbG: 0.4, fatG: 0, portion: '400 ml' },
      { name: 'Chicken stock', chinese: '雞湯', icon: 'soup', kcal: 7, proteinG: 1, carbG: 0.5, fatG: 0.2, portion: '350 ml' },
    ],
  },
]
