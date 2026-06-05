import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { CLOTHES_CATEGORIES } from '@/src/shared/constants/clothesCategories'
import type { CreateClotheInput } from '@/src/domain/rules/clothesSchema'

type ClotheFormProps = {
  title: string
  subtitle: string
  submitLabel: string
  submitLoadingLabel: string
  control: Control<CreateClotheInput>
  errors: FieldErrors<CreateClotheInput>
  imageUri: string
  errorText: string | null
  isSubmitting: boolean
  onPickImage: () => void
  onTakePhoto: () => void
  onSubmit: () => void
}

export default function ClotheForm({
  title,
  subtitle,
  submitLabel,
  submitLoadingLabel,
  control,
  errors,
  imageUri,
  errorText,
  isSubmitting,
  onPickImage,
  onTakePhoto,
  onSubmit,
}: ClotheFormProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

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
        <Pressable style={styles.secondaryButton} onPress={onPickImage}>
          <Text style={styles.secondaryButtonText}>Choisir en galerie</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onTakePhoto}>
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
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMethod="resize" /> : null}

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

      <Text style={styles.label}>Categorie</Text>
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <View style={styles.categoryWrap}>
            {CLOTHES_CATEGORIES.map((category) => {
              const selected = value === category
              return (
                <Pressable
                  key={category}
                  onPress={() => onChange(category)}
                  style={[styles.categoryChip, selected ? styles.categoryChipActive : undefined]}
                >
                  <Text style={[styles.categoryChipText, selected ? styles.categoryChipTextActive : undefined]}>
                    {category}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        )}
      />
      {errors.category ? <Text style={styles.errorText}>{errors.category.message}</Text> : null}

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
      {errors.description ? <Text style={styles.errorText}>{errors.description.message}</Text> : null}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Visible publiquement</Text>
        <Controller
          control={control}
          name="isPublic"
          render={({ field: { onChange, value } }) => <Switch value={value} onValueChange={onChange} />}
        />
      </View>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <Pressable
        onPress={onSubmit}
        style={[styles.button, isSubmitting ? styles.buttonDisabled : undefined]}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? submitLoadingLabel : submitLabel}</Text>
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
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  categoryChipActive: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDFA',
  },
  categoryChipText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#115E59',
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
})

