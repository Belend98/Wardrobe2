import { zodResolver } from '@hookform/resolvers/zod'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from 'react-native'

import { pickImageFromLibrary, takePhotoWithCamera } from '@/src/infrastructure/storage/camera.service'
import { toErrorMessage } from '@/src/shared/utils/errors'
import { CLOTHES_CATEGORIES } from '@/src/shared/constants/clothesCategories'
import { createClotheSchema, type CreateClotheInput } from '@/src/domain/rules/clothesSchema'
import { clothingCrudService } from '@/src/composition/clothing'

function isClothesCategory(value: unknown): value is CreateClotheInput['category'] {
  return (
    typeof value === 'string' &&
    CLOTHES_CATEGORIES.includes(value as (typeof CLOTHES_CATEGORIES)[number])
  )
}

export function useEditClotheForm() {
  const { id } = useLocalSearchParams<{ id?: string }>()

  const [isLoading, setIsLoading] = useState(true)
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

  const {
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const imageUri = watch('imageUrl')

  useEffect(() => {
    let mounted = true

    async function loadClothe() {
      if (!id) {
        setErrorText('ID du vêtement manquant.')
        setIsLoading(false)
        return
      }

      try {
        const clothe = await clothingCrudService.getMyClotheById(id)
        if (!mounted) return

        reset({
          name: clothe.name,
          imageUrl: clothe.imageUrl,
          category: isClothesCategory(clothe.category) ? clothe.category : 'T-shirt',
          color: clothe.color ?? '',
          description: clothe.description ?? '',
          isPublic: clothe.isPublic,
        })
      } catch (error) {
        if (!mounted) return
        setErrorText(toErrorMessage(error))
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadClothe()

    return () => {
      mounted = false
    }
  }, [id, reset])

  const handlePickImage = async () => {
    try {
      const media = await pickImageFromLibrary()
      if (!media) return

      setImageBase64(media.base64 ?? null)
      setValue('imageUrl', media.uri, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      Alert.alert('Erreur', toErrorMessage(error))
    }
  }

  const handleTakePhoto = async () => {
    try {
      const media = await takePhotoWithCamera()
      if (!media) return

      setImageBase64(media.base64 ?? null)
      setValue('imageUrl', media.uri, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } catch (error) {
      Alert.alert('Erreur', toErrorMessage(error))
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!id) return

    setErrorText(null)

    try {
      await clothingCrudService.updateMyClothe(id, {
        name: data.name,
        imageUrl: data.imageUrl,
        imageBase64,
        category: data.category,
        color: data.color?.trim() ? data.color : null,
        description: data.description?.trim() ? data.description : null,
        isPublic: data.isPublic,
      })

      Alert.alert('Succes', 'Vetement modifie.')
      router.back()
    } catch (error) {
      setErrorText(toErrorMessage(error))
    }
  })

  return {
    ...form,
    id,
    imageUri,
    isLoading,
    isSubmitting,
    errorText,
    handlePickImage,
    handleTakePhoto,
    onSubmit,
  }
}
