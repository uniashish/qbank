import { Image, Text, View } from "@react-pdf/renderer";

function ImagePdfRenderer({
  alt = "Image",
  includeImages = true,
  src,
  styles,
}) {
  if (includeImages && src) {
    return (
      <View style={styles.richImageFrame} wrap={false}>
        <Image src={src} style={styles.richImage} />
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
