import { pickImageFromLibrary, takePhotoWithCamera } from '@/src/infrastructure/storage/camera.service'
import { toErrorMessage } from '@/src/shared/utils/errors'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from 'react-native'
import { createClotheSchema, type CreateClotheInput } from '@/src/domain/rules/clothesSchema'
import { createMyClothe } from '@/src/application/services/clothesService'

export function useCreateClotheForm() {
  const [errorText, setErrorText] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)

  const form = useForm<CreateClotheInput>({
    resolver: zodResolver(createClotheSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      category: 'T-shirt',
      color: '',
      description: '',
      isPublic: true,
    },
  })

  const { setValue, reset, handleSubmit, watch } = form

  const imageUri = watch('imageUrl')

  const setSelectedImage = useCallback(
    (media: { uri: string; base64?: string | null } | null) => {
      if (!media) return

      setImageBase64(media.base64 ?? null)
      setValue('imageUrl', media.uri, {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [setValue],
  )

  const handlePickImage = useCallback(async () => {
    try {
      const media = await pickImageFromLibrary()
      setSelectedImage(media)
    } catch (error) {
      Alert.alert('Erreur', toErrorMessage(error))
    }
  }, [setSelectedImage])

  const handleTakePhoto = useCallback(async () => {
    try {
      const media = await takePhotoWithCamera()
      setSelectedImage(media)
    } catch (error) {
      Alert.alert('Erreur', toErrorMessage(error))
    }
  }, [setSelectedImage])

  const onSubmit = useCallback(
    async (data: CreateClotheInput) => {
      setErrorText(null)

      try {
        await createMyClothe({
          name: data.name,
          imageUrl: data.imageUrl,
          imageBase64,
          category: data.category,
          color: data.color?.trim() ? data.color : null,
          description: data.description?.trim() ? data.description : null,
          isPublic: data.isPublic,
        })

        Alert.alert('Succès', 'Vêtement publié.')
        reset()
        setImageBase64(null)
      } catch (error) {
        setErrorText(toErrorMessage(error))
      }
    },
    [imageBase64, reset],
  )

  return {
    ...form,
    imageUri,
    errorText,
    handlePickImage,
    handleTakePhoto,
    submitForm: handleSubmit(onSubmit),
  }
}
