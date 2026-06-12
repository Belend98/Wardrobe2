import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert } from 'react-native'
import { toErrorMessage } from '@/src/shared/utils/errors'
import { createUserSchema, type CreateUserInput } from '@/src/domain/rules/userSchema'
import { userService } from '@/src/composition/user'

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
        const profile = await userService.getCurrentUserProfileOrThrow()

        if (!mounted) return

        reset({
          username: profile.username,
          bio: profile.bio ?? '',
        })
      } catch (error) {
        if (mounted) setErrorText(toErrorMessage(error, 'Impossible de modifier le profil.'))
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
      await userService.updateCurrentUserProfile({
        username: data.username,
        bio: data.bio,
      })

      Alert.alert('Succes', 'Profil mis a jour.')
      router.back()
    } catch (error) {
      setErrorText(toErrorMessage(error, 'Impossible de modifier le profil.'))
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
