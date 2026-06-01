import { StyleSheet, Text, View } from 'react-native'
import ClotheForm from '../component/ClotheForm'
import { useEditClotheForm } from '../hooks/useEditClothesForm'

export default function EditClotheScreen() {
  const {
    control,
    formState: { errors },
    isLoading,
    isSubmitting,
    errorText,
    imageUri,
    handlePickImage,
    handleTakePhoto,
    onSubmit,
  } = useEditClotheForm()

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <ClotheForm
      title="Modifier un vêtement"
      subtitle="Mets a jour les informations de ta pièce."
      submitLabel="Enregistrer"
      submitLoadingLabel="Enregistrement..."
      control={control}
      errors={errors}
      imageUri={imageUri}
      errorText={errorText}
      isSubmitting={isSubmitting}
      onPickImage={handlePickImage}
      onTakePhoto={handleTakePhoto}
      onSubmit={onSubmit}
    />
  )
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  stateText: {
    color: '#6B7280',
  },
})
