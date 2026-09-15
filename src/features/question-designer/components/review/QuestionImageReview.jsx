import ImagePreview from "../media/ImagePreview.jsx";

function QuestionImageReview({ image }) {
  const hasImage = Boolean(image?.previewUrl || image?.downloadUrl);

  if (!hasImage) {
    return null;
  }

  return (
    <ImagePreview
      alt="Question image preview"
      image={image}
      isLoading={Boolean(image.isLoading)}
    />
  );
}

export default QuestionImageReview;
