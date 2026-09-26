const pool = require("../dbcon");

let ready = false;

async function ensureSiteContent(connection = pool) {
  if (ready) return true;

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS most_loved_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      video_url TEXT NOT NULL,
      poster_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      image TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS stay_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nights TEXT,
      price REAL DEFAULT 0,
      image TEXT,
      property_id INTEGER,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [[videos]] = await connection.query("SELECT COUNT(*) AS total FROM most_loved_videos");
  if (!videos.total) {
    await connection.execute(
      `INSERT INTO most_loved_videos (title, video_url, poster_url, sort_order, is_active) VALUES
        ('Creek light', 'https://videos.pexels.com/video-files/5896379/5896379-hd_1080_1920_24fps.mp4', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvQXX-m1YAw4awxbx4GONUbuQPeZdhrFEQOwzU91kJQXOn6YqeNqMJRHJT4frOheZxt7dB2eW6dFZaB9sxqIECV0KEGkx0RubqDqgXRyaC8lES3AswDmFtrN4D_ovSVtPhIfDDaNmDl4sGz48rzgZIaflsDN3isZWaIQJWm8-RPRf3px40vmBpisc5gnrNtlvGLW1bRAjaLw6aeNDSEkegFemTjuL0etM-l_s6jCN9xEiwQ2J6HCzftg', 1, 1),
        ('The drive in', 'https://videos.pexels.com/video-files/4434242/4434242-hd_1080_1920_24fps.mp4', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlx6YwXBTL_qeMBaCDX_x-TMjFEmol9IZwElNVid3Ggz1j71m6GGa1sTFiqVNLyccwB1SAvksaJEur_UCXZUqTxtN_cFTexT7hzRglJlUQID3rlHXf2Sb0C_7HMVHjuUdQn4RsHoaprvLLni-j6Qt6XPOV-FCSjQ04_QkO3w7fRXrk3YYbpzNraG03A6tmx3lMk5_ju0pGQ-qHmhA3AQ0NeIQfKbzlzcug1pOCe0Rwy6mHWHT-ttXQGg', 2, 1),
        ('Above the clouds', 'https://videos.pexels.com/video-files/4763824/4763824-hd_1280_720_24fps.mp4', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9bj6Y3ZgBSwalVmTnEU77AclenY0Otl_tnyNXgCDX3XSRANXSDiO1ILdu1957pkuNAgaybPWnjeWNCju0M3_GZy-YgMU9MartjgOnvkfEv8e4E1vP2J_rAEvj0t0M7TYYUf8WQRMPlOMZ-Yg0Rw94qIaiUkULmELOC4y6IgcKqly45slNvXAPPW1-9DcC7hwrzwu-pYnD8oLc4v0eIRKYBQVo_C9q9weBiE94pxU-gUzIf_UoA7vzmw', 3, 1),
        ('Last light', 'https://videos.pexels.com/video-files/1093662/1093662-hd_1280_720_30fps.mp4', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOGCtrPixi_yKstoQ8ARI3bGkJWEkA0y_570DBCdA0MVtowHUvm4NpdhLrIrR2YBeoN925m4k2IISqqDh8Pug24e6esjWDYHvuSaYuQfkAV4KUm0KsGtbWNQhBkJTcGK6r_wgu5YDJIrt2xynEJhgAT3Xt8HfJ50XgpXqkv2t21caFHKZ6ikxGTOkzIsF5BoK7GLjp4FFD3v1E9P81H4vpCnw313UK753H9GaF2CemADOsTzeh0JjVoA', 4, 1)`,
    );
  }

  const [[experienceCount]] = await connection.query("SELECT COUNT(*) AS total FROM experiences");
  if (!experienceCount.total) {
    await connection.execute(
      `INSERT INTO experiences (name, icon, image, description, sort_order, is_active) VALUES
        ('Paragliding', 'paragliding', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCymd4KrUQfi--qHcVqH8fCscQfZB96cYd8DY4hpWgkRLi5pfo4fUmrKyeh2qbtMWSUX4Jsb0AW2TCVEmjws-GrYDMQoIriLv7B4ffSsry6F_DlaUdIO4fNdSmkJfVIYkHc3pK0PoSo2mtwxMYCCfuvOc3QuiFp3G1u1KPrJch2ki2YBx_o7BP3mXrfOC5rFbe-D6OB7l47AB3anGMcr4zP8vB2h6Mm6C0NpelQ_g-1UQJ5JLT2GVVe1w', 'Add to your stay', 1, 1),
        ('Live music', 'music_note', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr45_JJmTQaLWLzad7MqcOmpncBg0fj5I0ysIdL-GZjqWrkVGguaVXcPNiUP8T8NcQOrmSQ6Qd2lefA-KQbHJbFgGj8xwjJDx9HKOpmcRoOEtbhVL9rCRAbBufkyRsBRiNidjYspOwfS5fvYgFQ255Il-ZwviFINIPwXSyIhrQV7vBTFWjYd1sSY0vn87_LBtdZNUS1Z4DcHHCT8Blp4QwOk3cAn4YtnMnICB1IvSmowfNITDZuzNjLg', 'Add to your stay', 2, 1),
        ('Boating', 'sailing', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCatKsmpOGmqKRKD8cGcfBGwSNp1fLXZIQTb_GjOseHuy1t7Xept4IBu2qUq_Brn9JvV0lJzCXbN80HaPPMAlnJIgoJQW1SFMUfKmSRkCBr4VZ6ptxVs7h405p6LpsQxzikKcXBb9y8UKFCG2kTO73mtTchIzr4w1ynmhUJxudN_uoU4ArZSqxxzU12OA4lTM-yqEhzKYjrnH1ANdMh_cjly5RZbzD_fllO-oWJrHpJ10mEvzYEvrFUBQ', 'Add to your stay', 3, 1)`,
    );
  }

  const [[packageCount]] = await connection.query("SELECT COUNT(*) AS total FROM stay_packages");
  if (!packageCount.total) {
    await connection.execute(
      `INSERT INTO stay_packages (name, nights, price, image, description, sort_order, is_active) VALUES
        ('Weekend Valley Escape', '2N / 3D', 24000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjqVhYz0UWIUTogChV8SvQAoIAXU20rEd03wSPWnxb1uIE9WSqWNjpFYQcsO3Ws-AqcQcNu7NcPsxti-7kPFzy-38Nc2HKnpVnQTHuIE--ME9rL1hVfreY78HWNhkvoxPJk0JIk_xShLRdSrvLQheVRNTe78UIDq9hJexSbMsgLjAw366bSo9Ty-WrwSiuyhO6AtRsebrsvdXnDAXftKJuIyHlrCkjHVAxEEu8a6pbSB5gQ6mBpJP8Mg', 'A long weekend in the hills', 1, 1),
        ('Monsoon Villa Party', '1N / 2D', 18500, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV22_c2YpGWR9siDuzZI9rWAWSQgzsRWyEeOkv3gRioW6pw5zFmz1FOTA0aEzQkQCbMDajhZGMROW8QFiy2XnffUe836nDxO5OTvopOHFqVBGFfXE8Xw4WqIYL5n6IJtoQip498_zY2lh1rqxOe6wPh54dLRhyW9Y4LZ6aW2jrQikCOWo0IqLaZNrM2NdKLXqkbQwTlPybEH7jKebcCR2awq_NitpXJe-m4aqXysdxt2blGl3gfai6Dg', 'Poolside villa night', 2, 1)`,
    );
  }

  const [[reviewCount]] = await connection.query("SELECT COUNT(*) AS total FROM testimonials");
  if (!reviewCount.total) {
    await connection.execute(
      `INSERT INTO testimonials (name, location, image, rating, text) VALUES
        ('Alex M.', 'Lonavala', NULL, 5, 'Unreal experience booking our villa party. The host was amazing and the location was literally exactly as pictured. 10/10.'),
        ('Sarah K.', 'Karjat', NULL, 5, 'The app is so slick and easy to use. Found a hidden gem of a cottage in the mountains within minutes. Peace of mind guaranteed.'),
        ('Rahul P.', 'Mulshi', NULL, 5, 'Clean stay, honest photos, and checkout was simpler than any other booking site we have used.')`,
    );
  }

  ready = true;
  return true;
}

module.exports = { ensureSiteContent };
