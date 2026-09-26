function generateSlug(title) {
    if (!title || typeof title !== "string") return "";
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function generateUniqueAccommodationSlug(connection, name, excludeId = null) {
    let baseSlug = generateSlug(name);
    if (!baseSlug) {
        baseSlug = `accommodation-${excludeId ?? Date.now()}`;
    }

    let slug = baseSlug;
    let suffix = 1;

    while (true) {
        const params = [slug];
        let query =
            "SELECT id FROM accommodations WHERE slug = ?";
        if (excludeId !== null) {
            query += " AND id != ?";
            params.push(excludeId);
        }

        const [rows] = await connection.execute(query, params);
        if (rows.length === 0) break;

        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
    }

    return slug;
}

module.exports = { generateSlug, generateUniqueAccommodationSlug };
