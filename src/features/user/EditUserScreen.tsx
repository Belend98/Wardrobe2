import { Controller } from 'react-hook-form'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useEditUserProfile } from './hooks/useEditProfil'

export default function EditUserScreen() {
  const {
    control,
    formState: { errors },
    isLoading,
    isSubmitting,
    errorText,
    submitForm,
  } = useEditUserProfile()

  if (isLoading) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier le profil</Text>
      <Text style={styles.subtitle}>
        Mets à jour les attributs de ton compte.
      </Text>

      <Text style={styles.label}>
        Nom d'utilisateur
      </Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Entrez un nom"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      {errors.username && (
        <Text style={styles.errorText}>
          {errors.username.message}
        </Text>
      )}

      <Text style={styles.label}>
        Bio
      </Text>

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Courte biographie"
            multiline
            numberOfLines={3}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      {errors.bio && (
        <Text style={styles.errorText}>
          {errors.bio.message}
        </Text>
      )}

      {errorText && (
        <Text style={styles.errorText}>
          {errorText}
        </Text>
      )}

      <Pressable
        onPress={submitForm}
        disabled={isSubmitting}
        style={[
          styles.button,
          isSubmitting && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {isSubmitting
            ? 'Enregistrement...'
            : 'Enregistrer'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
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
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 16,
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
    marginTop: 6,
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
