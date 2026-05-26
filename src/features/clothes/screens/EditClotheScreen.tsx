import { zodResolver } from '@hookform/resolvers/zod'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { pickImageFromLibrary, takePhotoWithCamera } from '@/src/features/camera/camera.service'
import { createClotheSchema, type CreateClotheInput } from '../clothesSchema'
import { getMyClotheById, updateMyClothe } from '../clothesService'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return 'Une erreur est survenue.'
}

export default function EditClotheScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const [isLoading, setIsLoading] = React.useState(true)
  const [errorText, setErrorText] = React.useState<string | null>(null)
  const [imageBase64, setImageBase64] = React.useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateClotheInput>({
    resolver: zodResolver(createClotheSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      color: '',
      description: '',
      isPublic: true,
    },
  })

  const imageUri = watch('imageUrl')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
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
    })()

    return () => {
      mounted = false
    }
  }, [id, reset])

  const handlePickImage = async () => {
    try {
      const media = await pickImageFromLibrary()
      if (!media) return
      setImageBase64(media.base64 ?? null)
      setValue('imageUrl', media.uri, { shouldValidate: true, shouldDirty: true })
    } catch (error) {
      Alert.alert('Erreur', getErrorMessage(error))
    }
  }

  const handleTakePhoto = async () => {
    try {
      const media = await takePhotoWithCamera()
      if (!media) return
      setImageBase64(media.base64 ?? null)
      setValue('imageUrl', media.uri, { shouldValidate: true, shouldDirty: true })
    } catch (error) {
      Alert.alert('Erreur', getErrorMessage(error))
    }
  }

  const onSubmit = async (data: CreateClotheInput) => {
    if (!id) return
    setErrorText(null)

    try {
      await updateMyClothe(id, {
        name: data.name,
        imageUrl: data.imageUrl,
        imageBase64,
        color: data.color?.trim() ? data.color : null,
        description: data.description?.trim() ? data.description : null,
        isPublic: data.isPublic,
      })

      Alert.alert('Succes', 'Vetement modifie.')
      router.back()
    } catch (error) {
      setErrorText(getErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Modifier un vetement</Text>
      <Text style={styles.subtitle}>Mets a jour les informations de ta piece.</Text>

      <Text style={styles.label}>Nom</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Ex: T-shirt blanc"
            style={styles.input}
          />
        )}
      />
      {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}

      <Text style={styles.label}>URL image</Text>
      <View style={styles.mediaActions}>
        <Pressable style={styles.secondaryButton} onPress={handlePickImage}>
          <Text style={styles.secondaryButtonText}>Choisir en galerie</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleTakePhoto}>
          <Text style={styles.secondaryButtonText}>Prendre une photo</Text>
        </Pressable>
      </View>
      <Controller
        control={control}
        name="imageUrl"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="https://..."
            style={styles.input}
          />
        )}
      />
      {errors.imageUrl ? <Text style={styles.errorText}>{errors.imageUrl.message}</Text> : null}
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} /> : null}

      <Text style={styles.label}>Couleur (optionnel)</Text>
      <Controller
        control={control}
        name="color"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Ex: noir"
            style={styles.input}
          />
        )}
      />
      {errors.color ? <Text style={styles.errorText}>{errors.color.message}</Text> : null}

      <Text style={styles.label}>Description (optionnel)</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Ex: Porte 2 fois"
            style={[styles.input, styles.multiline]}
            multiline
            numberOfLines={4}
          />
        )}
      />
      {errors.description ? (
        <Text style={styles.errorText}>{errors.description.message}</Text>
      ) : null}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Visible publiquement</Text>
        <Controller
          control={control}
          name="isPublic"
          render={({ field: { onChange, value } }) => (
            <Switch value={value} onValueChange={onChange} />
          )}
        />
      </View>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        style={[styles.button, isSubmitting ? styles.buttonDisabled : undefined]}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: '#4B5563',
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: '#111827',
  },
  mediaActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: '#E5E7EB',
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  switchRow: {
    marginTop: 2,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    color: '#B91C1C',
    marginBottom: 12,
  },
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
