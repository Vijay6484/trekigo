const express = require("express");
const pool = require("../dbcon");

function publicUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = (process.env.PUBLIC_API_URL || "http://localhost:5001").replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function parseJson(value, fallback) {
  if (Array.isArray(value) || (value && typeof value === "object")) return value;
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapStayType(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("camp")) return "camping";
  if (value.includes("cott")) return "cottage";
  return "villa";
}

function formatPrice(amount) {
  const number = Number(amount) || 0;
  return number.toLocaleString("en-IN");
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80";

async function amenityList(amenityIds) {
  const ids = parseJson(amenityIds, []).map((id) => Number(id)).filter(Boolean);
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(",");
  const [rows] = await pool.execute(
    `SELECT name, icon FROM amenities WHERE id IN (${placeholders}) AND active = 1`,
    ids,
  );
  return rows;
}

async function mapProperty(row, extras = {}) {
  const images = parseJson(row.images, []).map(publicUrl).filter(Boolean);
  if (extras.gallery) {
    extras.gallery.forEach((url) => {
      const next = publicUrl(url);
      if (next && !images.includes(next)) images.push(next);
    });
  }
  const amenities = extras.amenities || [];
  const rating = extras.rating || "4.8";
  return {
    id: String(row.id),
    name: row.name,
    code: `${mapStayType(row.type).slice(0, 3).toUpperCase()}-${String(row.id).padStart(3, "0")}`,
    loc: row.city_name || row.address || "Maharashtra",
    price: formatPrice(row.price),
    nightly: Number(row.price) || 0,
    type: mapStayType(row.type),
    rating: String(rating),
    img: images[0] || extras.fallbackImage || FALLBACK_IMAGE,
    description: row.description || "",
    images: images.length ? images : [extras.fallbackImage || FALLBACK_IMAGE],
    amenities,
    rooms: Number(row.rooms) || 1,
    capacity: Number(row.capacity) || 2,
    address: row.address || "",
    available: Boolean(row.available),
  };
}

async function loadProperties({ id } = {}) {
  let query = `
    SELECT a.*, c.name AS city_name
    FROM accommodations a
    LEFT JOIN cities c ON a.city_id = c.id
    WHERE a.available = 1
  `;
  const params = [];
  if (id) {
    query += /^\d+$/.test(String(id)) ? " AND a.id = ?" : " AND a.slug = ?";
    params.push(id);
  }
  query += " ORDER BY a.id DESC";
  const [rows] = await pool.execute(query, params);

  const mapped = [];
  for (const row of rows) {
    const [gallery] = await pool.execute(
      "SELECT imgUrl FROM accommodation_images WHERE accommodationId = ? AND IFNULL(isDeleted, 0) = 0 ORDER BY imgPosition ASC, imageId ASC",
      [row.id],
    );
    const [ratings] = await pool.execute(
      "SELECT ROUND(AVG(rating), 1) AS rating FROM testimonials WHERE location = ? OR location = ?",
      [row.name, String(row.id)],
    );
    mapped.push(
      await mapProperty(row, {
        gallery: gallery.map((item) => item.imgUrl),
        amenities: await amenityList(row.amenity_ids),
        rating: ratings[0]?.rating || "4.8",
      }),
    );
  }
  return mapped;
}

function crudRouter(table, fields) {
  const router = express.Router();

  router.get("/", async (_req, res) => {
    try {
      const [rows] = await pool.execute(`SELECT * FROM ${table} ORDER BY sort_order ASC, id DESC`);
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const columns = fields.filter((field) => req.body[field] !== undefined);
      if (!columns.length) {
        return res.status(400).json({ success: false, message: "No fields provided" });
      }
      const placeholders = columns.map(() => "?").join(", ");
      const values = columns.map((field) => req.body[field]);
      const [result] = await pool.execute(
        `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
        values,
      );
      const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
      res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const columns = fields.filter((field) => req.body[field] !== undefined);
      if (!columns.length) {
        return res.status(400).json({ success: false, message: "No fields provided" });
      }
      const values = columns.map((field) => req.body[field]);
      await pool.execute(
        `UPDATE ${table} SET ${columns.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`,
        [...values, req.params.id],
      );
      const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
}

const mostLovedRouter = crudRouter("most_loved_videos", [
  "title",
  "video_url",
  "poster_url",
  "sort_order",
  "is_active",
]);
const experiencesRouter = crudRouter("experiences", [
  "name",
  "icon",
  "image",
  "description",
  "sort_order",
  "is_active",
]);
const packagesRouter = crudRouter("stay_packages", [
  "name",
  "nights",
  "price",
  "image",
  "property_id",
  "description",
  "sort_order",
  "is_active",
]);

const publicRouter = express.Router();

publicRouter.get("/properties", async (req, res) => {
  try {
    const data = await loadProperties();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

publicRouter.get("/properties/:id/calendar", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT date(blocked_date) AS date, rooms, adult_price, child_price, reason
       FROM blocked_dates
       WHERE accommodation_id = ?
       ORDER BY blocked_date ASC`,
      [req.params.id],
    );
    res.json({
      success: true,
      data: rows.map((row) => ({
        date: row.date,
        rooms: row.rooms === null || row.rooms === "null" ? null : Number(row.rooms),
        adult_price: row.adult_price === null ? null : Number(row.adult_price),
        child_price: row.child_price === null ? null : Number(row.child_price),
        blocked: row.rooms === null || row.rooms === "null",
        reason: row.reason || "",
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

publicRouter.get("/properties/:id", async (req, res) => {
  try {
    const data = await loadProperties({ id: req.params.id });
    if (!data.length) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

publicRouter.get("/most-loved", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM most_loved_videos WHERE is_active = 1 ORDER BY sort_order ASC, id DESC",
    );
    res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        title: row.title,
        videoUrl: publicUrl(row.video_url),
        posterUrl: publicUrl(row.poster_url),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

publicRouter.get("/experiences", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM experiences WHERE is_active = 1 ORDER BY sort_order ASC, id DESC",
    );
    res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        icon: row.icon || "explore",
        img: publicUrl(row.image),
        description: row.description || "Add to your stay",
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

publicRouter.get("/packages", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM stay_packages WHERE is_active = 1 ORDER BY sort_order ASC, id DESC",
    );
    res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        nights: row.nights || "",
        price: formatPrice(row.price),
        img: publicUrl(row.image),
        propertyId: row.property_id ? String(row.property_id) : "",
        description: row.description || "",
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

publicRouter.get("/reviews", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, location, image, rating, text
       FROM testimonials
       ORDER BY created_at DESC`,
    );
    res.json({
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        name: row.name,
        location: row.location,
        image: publicUrl(row.image),
        rating: Number(row.rating) || 5,
        text: row.text,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  mostLovedRouter,
  experiencesRouter,
  packagesRouter,
  publicRouter,
};
