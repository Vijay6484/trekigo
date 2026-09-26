import { useEffect, useState } from "react";
import ContentCollection, { type ContentField } from "./ContentCollection";
import { BASE_URL } from "../config/config";

export default function PackagesAdmin() {
  const [propertyOptions, setPropertyOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/properties/accommodations`)
      .then((response) => response.json())
      .then((data) => {
        setPropertyOptions(
          (data.data || []).map((item: { id: number; name: string }) => ({
            label: item.name,
            value: String(item.id),
          })),
        );
      })
      .catch(() => setPropertyOptions([]));
  }, []);

  const fields: ContentField[] = [
    { key: "name", label: "Package name", type: "text" },
    { key: "nights", label: "Duration", type: "text" },
    { key: "price", label: "Price", type: "number" },
    { key: "image", label: "Image", type: "image" },
    { key: "property_id", label: "Property", type: "select", options: propertyOptions },
    { key: "description", label: "Description", type: "textarea" },
    { key: "sort_order", label: "Order", type: "number" },
  ];

  return (
    <ContentCollection
      title="Packages"
      endpoint="/admin/packages"
      imageFolder="packages"
      fields={fields}
    />
  );
}
