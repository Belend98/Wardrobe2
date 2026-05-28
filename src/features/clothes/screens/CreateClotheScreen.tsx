import ClotheForm from '../component/ClotheForm'
import { useCreateClotheForm } from '../hooks/useCreateClothesForm'

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
      subtitle="Partage une piece avec la communaute."
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
