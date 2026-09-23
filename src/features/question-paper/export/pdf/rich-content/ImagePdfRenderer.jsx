import { Image, Text, View } from "@react-pdf/renderer";

const MAX_PDF_IMAGE_WIDTH = 500;

function normalizeDimension(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : null;
}

function getImageSizeStyle({ height, width }) {
  const normalizedWidth = normalizeDimension(width);

  if (!normalizedWidth) {
    return null;
  }

  const displayWidth = Math.min(normalizedWidth, MAX_PDF_IMAGE_WIDTH);
  const normalizedHeight = normalizeDimension(height);
  const displayHeight =
    normalizedHeight && normalizedWidth
      ? Math.round(displayWidth * (normalizedHeight / normalizedWidth))
      : null;

  return {
    ...(displayHeight ? { height: displayHeight } : {}),
    width: displayWidth,
  };
}

function ImagePdfRenderer({
  alt = "Image",
  height,
  includeImages = true,
  src,
  styles,
  width,
}) {
  if (includeImages && src) {
    const imageSizeStyle = getImageSizeStyle({ height, width });

    return (
      <View
        style={[
          styles.richImageFrame,
          imageSizeStyle ? styles.richImageFrameSized : null,
        ].filter(Boolean)}
        wrap={false}
      >
        <Image
          src={src}
          style={[styles.richImage, imageSizeStyle].filter(Boolean)}
        />
      </View>
    );
  }

  return (
    <Text style={styles.imagePlaceholder}>
      [{alt ? `Image: ${alt}` : "Image not included"}]
    </Text>
  );
}

export default ImagePdfRenderer;
