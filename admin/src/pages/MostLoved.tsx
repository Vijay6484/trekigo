import ContentCollection from "./ContentCollection";

export default function MostLoved() {
  return (
    <ContentCollection
      title="Most Loved Videos"
      endpoint="/admin/most-loved"
      imageFolder="videos"
      fields={[
        { key: "title", label: "Title", type: "text" },
        { key: "video_url", label: "Video", type: "video" },
        { key: "poster_url", label: "Poster image", type: "image" },
        { key: "sort_order", label: "Order", type: "number" },
      ]}
    />
  );
}
