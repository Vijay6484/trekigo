import ContentCollection from "./ContentCollection";

export default function ExperiencesAdmin() {
  return (
    <ContentCollection
      title="Experiences"
      endpoint="/admin/experiences"
      imageFolder="experiences"
      fields={[
        { key: "name", label: "Name", type: "text" },
        { key: "icon", label: "Icon", type: "text" },
        { key: "image", label: "Image", type: "image" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "sort_order", label: "Order", type: "number" },
      ]}
    />
  );
}
