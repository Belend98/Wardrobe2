import ClotheForm from '@/src/presentation/components/clothes/ClotheForm'
import { useCreateClotheForm } from '@/src/presentation/hooks/clothes/useCreateClothesForm'

const CreateClotheScreen = () => {
  const {
    control,
    submitForm,
    imageUri,
    errorText,
    handlePickImage,
    handleTakePhoto,
    formState: { errors, isSubmitting },
  } = useCreateClotheForm()

  return (
    <ClotheForm
      title="Publier un vetement"
      subtitle="Partage une piece avec la communauté."
      submitLabel="Publier"
      submitLoadingLabel="Publication..."
      control={control}
      errors={errors}
      imageUri={imageUri}
      errorText={errorText}
      isSubmitting={isSubmitting}
      onPickImage={handlePickImage}
      onTakePhoto={handleTakePhoto}
      onSubmit={submitForm}
    />
  )
}

export default CreateClotheScreen
