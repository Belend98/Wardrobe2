import { zodResolver } from '@hookform/resolvers/zod'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from 'react-native'

import { pickImageFromLibrary, takePhotoWithCamera } from '@/src/features/camera/camera.service'
import { CLOTHES_CATEGORIES } from '../clothesCategories'
import { createClotheSchema, type CreateClotheInput } from '../clothesSchema'
import { getMyClotheById, updateMyClothe } from '../clothesService'

function isClothesCategory(value: unknown): value is CreateClotheInput['category'] {
  return (
    typeof value === 'string' &&
    CLOTHES_CATEGORIES.includes(value as (typeof CLOTHES_CATEGORIES)[number])
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Une erreur est survenue.'
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
        setErrorText('ID du vetement manquant.')
        setIsLoading(false)
        return
      }

      try {
        const clothe = await getMyClotheById(id)
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
        setErrorText(getErrorMessage(error))
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
      Alert.alert('Erreur', getErrorMessage(error))
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
      Alert.alert('Erreur', getErrorMessage(error))
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (!id) return

    setErrorText(null)

    try {
      await updateMyClothe(id, {
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
      setErrorText(getErrorMessage(error))
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