require('dotenv').config();
const pool   = require('./db');
const bcrypt = require('bcryptjs');
const fs     = require('fs');
const path   = require('path');

async function seed() {
  const client = await pool.connect();
  try {
    // Create tables
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Tables created');

    // Seed users
    const adminHash  = await bcrypt.hash('admin123',  10);
    const sellerHash = await bcrypt.hash('seller123', 10);
    const buyerHash  = await bcrypt.hash('buyer123',  10);

    await client.query(`
      INSERT INTO users (id, name, email, password, role, phone) VALUES
        ('admin_demo',  'Admin',       'admin@demo.com',  $1, 'admin',  '+963-11-000-0000'),
        ('seller_demo', 'Demo Seller', 'seller@demo.com', $2, 'seller', '+963-11-000-0001'),
        ('buyer_demo',  'Demo Buyer',  'buyer@demo.com',  $3, 'buyer',  '+963-11-000-0002')
      ON CONFLICT (id) DO NOTHING
    `, [adminHash, sellerHash, buyerHash]);
    console.log('✅ Default users seeded');

    // Seed products
    const now = Date.now();
    const h4  = new Date(now + 4  * 3600000);
    const h24 = new Date(now + 24 * 3600000);
    const h48 = new Date(now + 48 * 3600000);
    const d7  = new Date(now + 7  * 86400000);

    const products = [
      ['p1',  'iPhone 15 Pro',          'آيفون 15 برو',            'Titanium design, A17 Pro chip',       'تصميم تيتانيوم، شريحة A17 برو',         'Electronics', 999,  879,  40, 'seller_demo', true,  10, h4,  true,  '{apple,smartphone}', 4.8],
      ['p2',  'Samsung Galaxy S24',     'سامسونج جالاكسي S24',     'Snapdragon 8 Gen 3, 6.2" AMOLED',    'معالج سنابدراغون، شاشة 6.2 AMOLED',     'Electronics', 849,  769,  35, 'seller_demo', true,  10, h24, true,  '{samsung,android}', 4.7],
      ['p3',  'MacBook Air M2',         'ماك بوك إير M2',          'Apple M2 chip, 13.6" Retina',         'شريحة M2، شاشة ريتينا 13.6 بوصة',       'Electronics', 1099, 979,  20, 'seller_demo', true,  10, h48, true,  '{apple,laptop}', 4.9],
      ['p4',  'Sony WH-1000XM5',        'سماعات سوني',             'Industry-leading noise cancellation', 'أفضل إلغاء ضوضاء في فئتها',             'Electronics', 349,  299,  60, 'seller_demo', false, 10, null,false, '{sony,headphones}', 4.8],
      ['p5',  'iPad Air 5th Gen',       'آيباد إير الجيل الخامس',  'M1 chip, 10.9" Liquid Retina',        'شريحة M1، شاشة ليكويد ريتينا',          'Electronics', 599,  549,  30, 'seller_demo', true,  10, d7,  true,  '{apple,tablet}', 4.7],
      ['p6',  'Nike Air Max 270',       'نايكي اير ماكس 270',      'Lightweight, Max Air cushioning',     'خفيف الوزن، وسادة هوائية',              'Sports',      120,  99,   50, 'seller_demo', false, 10, null,false, '{nike,shoes}', 4.6],
      ['p7',  'Adidas Ultraboost 23',   'أديداس الترابوست',        'Boost midsole, Primeknit upper',      'نعل بوست، جزء علوي برايم نيت',          'Sports',      180,  155,  45, 'seller_demo', true,  10, h24, false, '{adidas,running}', 4.7],
      ['p8',  'Classic White T-Shirt',  'تيشيرت أبيض كلاسيكي',    '100% cotton, premium quality',        'قطن 100٪، جودة عالية',                  'Clothing',    25,   18,   200,'seller_demo', true,  20, h48, false, '{cotton,basic}', 4.3],
      ['p9',  'Slim Fit Jeans',         'جينز سليم فيت',           'Stretch denim, modern fit',           'دنيم مرن، قصة عصرية',                   'Clothing',    65,   52,   80, 'seller_demo', true,  15, d7,  false, '{jeans,denim}', 4.5],
      ['p10', 'Organic Olive Oil 1L',   'زيت زيتون عضوي',          'Cold pressed, extra virgin',          'معصور بارد، بكر ممتاز',                  'Food',        18,   14,   300,'seller_demo', true,  30, h48, false, '{olive,organic}', 4.8],
      ['p11', 'Arabic Coffee 500g',     'قهوة عربية 500 جرام',     'Premium Arabic blend, cardamom',      'مزيج عربي فاخر مع هيل',                 'Food',        22,   17,   200,'seller_demo', true,  25, h24, false, '{coffee,arabic}', 4.9],
      ['p12', 'Smart LED Desk Lamp',    'مصباح مكتب LED ذكي',      'Touch control, 3 color temps',        'تحكم باللمس، 3 درجات حرارة لونية',      'Home',        45,   38,   90, 'seller_demo', true,  10, h48, false, '{lamp,smart}', 4.6],
      ['p13', 'Non-stick Cookware Set', 'طقم أواني طهي',           '5-piece non-stick set',               'طقم 5 قطع بطلاء غير لاصق',              'Home',        89,   72,   60, 'seller_demo', true,  10, d7,  false, '{cookware,kitchen}', 4.7],
      ['p14', 'The Alchemist Arabic',   'الخيميائي - رواية',       'Paulo Coelho, Arabic translation',    'باولو كويلو، الترجمة العربية',           'Books',       15,   11,   500,'seller_demo', true,  50, h24, false, '{novel,arabic}', 4.9],
      ['p15', 'Vitamin C Serum 30ml',   'سيروم فيتامين سي',        '20% Vitamin C, brightening serum',    'فيتامين سي 20٪، سيروم مضيء',            'Beauty',      35,   28,   150,'seller_demo', true,  20, h48, false, '{skincare,vitamin}', 4.7],
    ];

    function buildImg(category) {
      const map = { Electronics:'📱', Clothing:'👕', Food:'🍎', Home:'🏠', Sports:'⚽', Books:'📚', Beauty:'💄' };
      const colors = { Electronics:'#3b82f6', Clothing:'#ec4899', Food:'#22c55e', Home:'#f59e0b', Sports:'#ef4444', Books:'#8b5cf6', Beauty:'#f472b6' };
      const emoji = map[category] || '📦';
      const color = colors[category] || '#64748b';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${color}" opacity="0.7" rx="20"/><text x="200" y="220" text-anchor="middle" dominant-baseline="middle" font-size="120" font-family="system-ui">${emoji}</text></svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    for (const [id, nameEn, nameAr, descEn, descAr, category, price, wholesalePrice, stock, sellerId, isWholesale, minPart, deadline, isFeatured, tags, rating] of products) {
      await client.query(`
        INSERT INTO products (id,name_en,name_ar,desc_en,desc_ar,category,price,wholesale_price,stock,seller_id,is_wholesale,wholesale_min_participants,wholesale_deadline,is_featured,tags,rating,image)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        ON CONFLICT (id) DO NOTHING
      `, [id, nameEn, nameAr, descEn, descAr, category, price, isWholesale?wholesalePrice:null, stock, sellerId, isWholesale, minPart, deadline, isFeatured, tags, rating, buildImg(category)]);
    }
    console.log('✅ Products seeded');

    // Seed messages
    await client.query(`
      INSERT INTO messages (sender_id, receiver_id, message, read) VALUES
        ('seller_demo', 'buyer_demo', 'مرحباً! كيف يمكنني مساعدتك؟', true),
        ('buyer_demo', 'seller_demo', 'أريد الاستفسار عن iPhone 15 Pro', true),
        ('seller_demo', 'buyer_demo', 'المنتج متوفر وسعر الجملة متاح حتى مساء اليوم', true),
        ('buyer_demo', 'seller_demo', 'ممتاز، هل يمكن التوصيل لدمشق؟', false)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Messages seeded');

    // Seed reviews
    await client.query(`
      INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES
        ('p1', 'buyer_demo', 'Demo Buyer', 5, 'منتج رائع جداً، يستحق السعر'),
        ('p2', 'buyer_demo', 'Demo Buyer', 4, 'Samsung ممتاز للاستخدام اليومي'),
        ('p10','buyer_demo', 'Demo Buyer', 5, 'زيت زيتون عضوي أصلي 100٪')
      ON CONFLICT (product_id, user_id) DO NOTHING
    `);
    console.log('✅ Reviews seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDefault accounts:');
    console.log('  Admin:  admin@demo.com  / admin123');
    console.log('  Seller: seller@demo.com / seller123');
    console.log('  Buyer:  buyer@demo.com  / buyer123');
  } catch(e) {
    console.error('❌ Seed error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
