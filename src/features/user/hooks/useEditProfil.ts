import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from 'react-native'
import { createUserSchema, type CreateUserInput } from '../userForm/userSchema'
import { getCurrentUserProfileOrThrow, updateCurrentUserProfile } from '../userService'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Impossible de modifier le profil.'
}

export function useEditUserProfile() {
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      bio: '',
    },
  })

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const profile = await getCurrentUserProfileOrThrow()

        if (!mounted) return

        reset({
          username: profile.username,
          bio: profile.bio ?? '',
        })
      } catch (error) {
        if (mounted) setErrorText(getErrorMessage(error))
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [reset])

  const onSubmit = async (data: CreateUserInput) => {
    setErrorText(null)

    try {
      await updateCurrentUserProfile({
        username: data.username,
        bio: data.bio,
      })

      Alert.alert('Succes', 'Profil mis a jour.')
      router.back()
    } catch (error) {
      setErrorText(getErrorMessage(error))
    }
  }

  return {
    ...form,
    isLoading,
    errorText,
    isSubmitting,
    submitForm: handleSubmit(onSubmit),
  }
}